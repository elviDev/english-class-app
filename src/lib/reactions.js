/**
 * Folds a flat list of reaction rows into a per-message summary:
 * { [messageId]: [{ emoji, count, mine, mineReactionId, userNames }] }
 * `mineReactionId` is what lets the toggle handler know whether the next
 * click should insert a new reaction or delete the caller's existing one.
 */
export function groupReactionsByMessage(rows, meId) {
  const byMessage = {};

  for (const row of rows) {
    const byEmoji = (byMessage[row.message_id] ??= {});
    const entry = (byEmoji[row.emoji] ??= {
      emoji: row.emoji,
      count: 0,
      mine: false,
      mineReactionId: null,
      userNames: [],
    });
    entry.count += 1;
    entry.userNames.push(row.user_name);
    if (row.user_id === meId) {
      entry.mine = true;
      entry.mineReactionId = row.id;
    }
  }

  const result = {};
  for (const [messageId, byEmoji] of Object.entries(byMessage)) {
    result[messageId] = Object.values(byEmoji);
  }
  return result;
}
