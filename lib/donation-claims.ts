import prisma from "@/lib/prisma";

const CLAIM_EXPIRATION_HOURS = 24;

/** Releases uncollected donation claims that have been active for 24 hours. */
export async function releaseExpiredDonationClaims() {
  const expirationCutoff = new Date(Date.now() - CLAIM_EXPIRATION_HOURS * 60 * 60 * 1000);

  const expiredClaims = await prisma.donation.findMany({
    where: {
      status: { in: ["REQUESTED", "APPROVED"] },
      claimedAt: { lt: expirationCutoff },
    },
    select: { id: true, claimantId: true },
  });

  if (!expiredClaims.length) return 0;

  const notifications = expiredClaims
    .filter((donation) => donation.claimantId)
    .map((donation) => ({
      type: "donation",
      title: "Donation claim expired",
      message: "Your donation claim expired after 24 hours without collection. The item is available again.",
      userId: donation.claimantId as string,
    }));

  await prisma.$transaction(async (tx) => {
    await tx.donation.updateMany({
      where: { id: { in: expiredClaims.map(({ id }) => id) } },
      data: {
        status: "AVAILABLE",
        claimantId: null,
        claimedAt: null,
      },
    });
    if (notifications.length) await tx.notification.createMany({ data: notifications });
  });

  return expiredClaims.length;
}
