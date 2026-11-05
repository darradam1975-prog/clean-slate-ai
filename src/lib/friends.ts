import { prisma } from "@/lib/db";

export const friendUserSelect = {
  id: true,
  username: true,
  avatarKind: true,
  avatarStyle: true,
} as const;

export type FriendUiStatus =
  | "self"
  | "none"
  | "outgoing"
  | "incoming"
  | "friends"
  | "declined";

type FriendActionResult =
  | { error: string; status: number }
  | { ok: true }
  | { friendshipId: string; accepted?: boolean };

export async function getAcceptedFriendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });

  return rows.map((row) =>
    row.requesterId === userId ? row.addresseeId : row.requesterId,
  );
}

export async function getProfileSocial(
  viewerId: string | null,
  profileUserId: string,
) {
  const friendCount = await prisma.friendship.count({
    where: {
      status: "accepted",
      OR: [{ requesterId: profileUserId }, { addresseeId: profileUserId }],
    },
  });

  if (!viewerId) {
    return {
      friendCount,
      status: "none" as const,
      friendshipId: null as string | null,
      viewerSignedIn: false,
    };
  }

  if (viewerId === profileUserId) {
    return {
      friendCount,
      status: "self" as const,
      friendshipId: null,
      viewerSignedIn: true,
    };
  }

  const row = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: viewerId, addresseeId: profileUserId },
        { requesterId: profileUserId, addresseeId: viewerId },
      ],
    },
  });

  if (!row || (row.status === "declined" && row.requesterId !== viewerId)) {
    return {
      friendCount,
      status: "none" as const,
      friendshipId: row?.status === "declined" ? row.id : null,
      viewerSignedIn: true,
    };
  }

  if (row.status === "accepted") {
    return {
      friendCount,
      status: "friends" as const,
      friendshipId: row.id,
      viewerSignedIn: true,
    };
  }

  if (row.status === "declined") {
    return {
      friendCount,
      status: "declined" as const,
      friendshipId: row.id,
      viewerSignedIn: true,
    };
  }

  return {
    friendCount,
    status: (row.requesterId === viewerId ? "outgoing" : "incoming") as FriendUiStatus,
    friendshipId: row.id,
    viewerSignedIn: true,
  };
}

export async function getFriendBoard(userId: string) {
  const rows = await prisma.friendship.findMany({
    where: {
      status: { in: ["pending", "accepted"] },
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: {
      requester: { select: friendUserSelect },
      addressee: { select: friendUserSelect },
    },
    orderBy: { createdAt: "desc" },
  });

  const friends = [];
  const incoming = [];
  const outgoing = [];

  for (const row of rows) {
    const other = row.requesterId === userId ? row.addressee : row.requester;
    const item = {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      user: other,
    };

    if (row.status === "accepted") friends.push(item);
    else if (row.addresseeId === userId) incoming.push(item);
    else outgoing.push(item);
  }

  return { friends, incoming, outgoing };
}

export async function sendFriendRequest(
  fromId: string,
  username: string,
): Promise<FriendActionResult> {
  const targetName = username.trim();
  if (!targetName) {
    return { error: "Enter a username.", status: 400 };
  }

  const target = await prisma.user.findFirst({
    where: { username: { equals: targetName, mode: "insensitive" } },
    select: { id: true },
  });

  if (!target) {
    return { error: "No one uses that username.", status: 404 };
  }

  if (target.id === fromId) {
    return { error: "You cannot add yourself.", status: 400 };
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: fromId, addresseeId: target.id },
        { requesterId: target.id, addresseeId: fromId },
      ],
    },
  });

  if (!existing) {
    const created = await prisma.friendship.create({
      data: {
        requesterId: fromId,
        addresseeId: target.id,
        status: "pending",
      },
    });
    return { friendshipId: created.id };
  }

  if (existing.status === "accepted") {
    return { error: "You are already friends.", status: 409 };
  }

  if (existing.status === "pending") {
    if (existing.requesterId === fromId) {
      return { error: "Friend request already sent.", status: 409 };
    }

    const updated = await prisma.friendship.update({
      where: { id: existing.id },
      data: { status: "accepted" },
    });
    return { friendshipId: updated.id, accepted: true };
  }

  if (existing.requesterId === fromId) {
    const updated = await prisma.friendship.update({
      where: { id: existing.id },
      data: { status: "pending" },
    });
    return { friendshipId: updated.id };
  }

  await prisma.friendship.delete({ where: { id: existing.id } });
  const created = await prisma.friendship.create({
    data: {
      requesterId: fromId,
      addresseeId: target.id,
      status: "pending",
    },
  });
  return { friendshipId: created.id };
}

export async function updateFriendship(
  actorId: string,
  friendshipId: string,
  action: string,
): Promise<FriendActionResult> {
  const row = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!row) return { error: "Friend request not found.", status: 404 };

  const isRequester = row.requesterId === actorId;
  const isAddressee = row.addresseeId === actorId;
  if (!isRequester && !isAddressee) {
    return { error: "That request is not yours.", status: 403 };
  }

  if (action === "accept") {
    if (!isAddressee || row.status !== "pending") {
      return {
        error: "Only the recipient can accept a pending request.",
        status: 400,
      };
    }
    await prisma.friendship.update({
      where: { id: row.id },
      data: { status: "accepted" },
    });
    return { ok: true };
  }

  if (action === "decline") {
    if (!isAddressee || row.status !== "pending") {
      return {
        error: "Only the recipient can decline a pending request.",
        status: 400,
      };
    }
    await prisma.friendship.update({
      where: { id: row.id },
      data: { status: "declined" },
    });
    return { ok: true };
  }

  if (action === "cancel") {
    if (!isRequester || row.status !== "pending") {
      return {
        error: "Only the sender can cancel a pending request.",
        status: 400,
      };
    }
    await prisma.friendship.delete({ where: { id: row.id } });
    return { ok: true };
  }

  if (action === "unfriend") {
    if (row.status !== "accepted") {
      return { error: "You are not friends yet.", status: 400 };
    }
    await prisma.friendship.delete({ where: { id: row.id } });
    return { ok: true };
  }

  return { error: "Unknown action.", status: 400 };
}
