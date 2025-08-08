let userId: string = "";
let chatSessionId: string = "";

export const getUserId = (): string | null => {
  return userId;
};

export const setUserId = (newUserId: string) => {
  userId = newUserId;
};

export const getChatSessionId = (): string | null => {
  return chatSessionId;
};

export const setChatSessionId = (newSessionId: string) => {
  chatSessionId = newSessionId;
};
