import { useChatStore } from "@/store/chat";
import { backendApi } from "@/services/api";
import { createPinia, setActivePinia } from "pinia";

jest.mock("@/services/api", () => ({
  backendApi: {
    get: jest.fn(),
  },
  chatterwillyApi: {
    post: jest.fn(),
  },
}));

describe("chat store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
  });

  it("fetches chat info from the backend api recent endpoint", async () => {
    (backendApi.get as jest.Mock).mockResolvedValue({
      data: {
        content: {
          messages: [],
          sessionId: "session-1",
          sessionToken: "token-1",
          status_chat: true,
          status_message: "online",
        },
      },
    });

    const store = useChatStore();
    const result = await store.getChatInfo();

    expect(backendApi.get).toHaveBeenCalledWith("/messages/recent");
    expect(result).toEqual({
      messages: [],
      sessionId: "session-1",
      sessionToken: "token-1",
      status_chat: true,
      status_message: "online",
    });
  });
});
