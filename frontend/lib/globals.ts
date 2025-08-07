let userId: string = "";

export const getUserId = (): string | null => {
  return userId;
};

export const setUserId = (newUserId: string) => {
  userId = newUserId;
};
