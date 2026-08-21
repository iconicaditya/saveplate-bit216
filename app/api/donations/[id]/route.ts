import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateToken } from "@/lib/auth-middleware";
import { releaseExpiredDonationClaims } from "@/lib/donation-claims";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticateToken(req); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 }); const { id } = await params;
  await releaseExpiredDonationClaims();
  const donation = await prisma.donation.findUnique({ where: { id }, include: { foodItem: true, donor: { select: { firstName: true, lastName: true, location: true } }, claimant: { select: { firstName: true, lastName: true } } } });
  if (!donation || (donation.status !== "AVAILABLE" && donation.donorId !== user.id && donation.claimantId !== user.id)) return NextResponse.json({ error: "Donation not found." }, { status: 404 });
  const approvedParticipant = donation.status === "APPROVED" && (donation.donorId === user.id || donation.claimantId === user.id);
  return NextResponse.json({ donation: { ...donation, pickupLocation: approvedParticipant ? donation.pickupLocation : null } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticateToken(req); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 }); const { id } = await params; const { action } = await req.json();
  await releaseExpiredDonationClaims();

  // Claim atomically so two users cannot successfully request the same available donation.
  if (action === "request") {
    const claim = await prisma.donation.updateMany({
      where: { id, status: "AVAILABLE", donorId: { not: user.id } },
      data: { status: "REQUESTED", claimantId: user.id, claimedAt: new Date() },
    });
    if (claim.count === 0) {
      return NextResponse.json({ error: "This donation is no longer available to claim." }, { status: 409 });
    }
    const claimedDonation = await prisma.donation.findUnique({ where: { id } });
    if (claimedDonation) await prisma.notification.create({ data: { type: "donation", title: "Donation requested", message: "A receiver requested your donation. Review it in My Donations.", userId: claimedDonation.donorId } });
    return NextResponse.json({ donation: claimedDonation, message: "Donation requested." });
  }

  const donation = await prisma.donation.findUnique({ where: { id } }); if (!donation) return NextResponse.json({ error: "Donation not found." }, { status: 404 });
  const receiverRequest = false;
  const donorApprove = action === "approve" && donation.status === "REQUESTED" && donation.donorId === user.id;
  const donorDecline = action === "decline" && donation.status === "REQUESTED" && donation.donorId === user.id;
  const receiverCancel = action === "cancel-request" && donation.status === "REQUESTED" && donation.claimantId === user.id;
  const donorCancel = action === "cancel" && ["AVAILABLE", "REQUESTED", "APPROVED"].includes(donation.status) && donation.donorId === user.id;
  const donorComplete = action === "complete" && donation.status === "APPROVED" && donation.donorId === user.id;
  if (![receiverRequest, donorApprove, donorDecline, receiverCancel, donorCancel, donorComplete].some(Boolean)) return NextResponse.json({ error: "This action is not allowed for the donation's current status." }, { status: 409 });
  const nextStatus = receiverRequest ? "REQUESTED" : donorApprove ? "APPROVED" : donorDecline ? "DECLINED" : receiverCancel || donorCancel ? "CANCELLED" : "COMPLETED";
  const updated = await prisma.$transaction(async (tx) => {
    const item = await tx.donation.update({ where: { id }, data: { status: nextStatus, ...(receiverRequest ? { claimantId: user.id, claimedAt: new Date() } : {}), ...(nextStatus === "CANCELLED" || nextStatus === "DECLINED" ? { cancelledAt: new Date() } : {}), ...(nextStatus === "COMPLETED" ? { completedAt: new Date() } : {}) } });
    if (nextStatus === "COMPLETED") await tx.foodItem.update({ where: { id: donation.foodItemId }, data: { status: "Donated" } });
    const noticeUser = receiverRequest ? donation.donorId : donation.claimantId;
    if (noticeUser) await tx.notification.create({ data: { type: "donation", title: `Donation ${nextStatus.toLowerCase()}`, message: nextStatus === "REQUESTED" ? "A receiver requested your donation. Review it in My Donations." : `A donation is now ${nextStatus.toLowerCase()}.`, userId: noticeUser } });
    return item;
  });
  return NextResponse.json({ donation: updated, message: `Donation ${nextStatus.toLowerCase()}.` });
}
