import { flushPromises, shallowMount } from "@vue/test-utils";
import FormChatComponent from "@/components/FormChatComponent.vue";
import { backendApi, chatterwillyApi } from "@/services/api";

jest.mock("@/services/api", () => ({
  backendApi: {
    post: jest.fn(),
  },
  chatterwillyApi: {
    post: jest.fn(),
  },
}));

describe("FormChatComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("posts to chatterwilly chat endpoint when the assistant is chatterwilly", async () => {
    (chatterwillyApi.post as jest.Mock).mockResolvedValue({
      data: {
        content: { text: "Hola desde chatterwilly" },
      },
    });

    const wrapper = shallowMount(FormChatComponent, {
      props: {
        session_id: "",
        session_token: "",
        reset_token: 0,
        assistant_id: "chatterwilly",
      },
    });

    await wrapper.find("#InputQuestion").setValue("Hola");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(chatterwillyApi.post).toHaveBeenCalledWith("/chat", {
      text: "Hola",
    });
    expect(backendApi.post).not.toHaveBeenCalled();
    expect(wrapper.emitted("messagesent")).toEqual([[true], [false]]);
  });

  it("allows sending more than one chatterwilly message", async () => {
    (chatterwillyApi.post as jest.Mock).mockResolvedValue({
      data: {
        content: { text: "Respuesta" },
      },
    });

    const wrapper = shallowMount(FormChatComponent, {
      props: {
        session_id: "",
        session_token: "",
        reset_token: 0,
        assistant_id: "chatterwilly",
      },
    });

    const input = wrapper.find("#InputQuestion");

    await input.setValue("Hola");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    await input.setValue("¿Qué puedes hacer?");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(chatterwillyApi.post).toHaveBeenNthCalledWith(1, "/chat", {
      text: "Hola",
    });
    expect(chatterwillyApi.post).toHaveBeenNthCalledWith(2, "/chat", {
      text: "¿Qué puedes hacer?",
    });
    expect(wrapper.emitted("messagesent")).toEqual([
      [true],
      [false],
      [true],
      [false],
    ]);
  });

  it("posts to the backend conversation endpoint when the assistant is diego", async () => {
    (backendApi.post as jest.Mock).mockResolvedValue({
      data: {
        content: {
          sessionToken: "session-token",
          sessionID: "session-id",
          counters: 0,
        },
      },
    });

    const wrapper = shallowMount(FormChatComponent, {
      props: {
        session_id: "session-id",
        session_token: "session-token",
        reset_token: 0,
        assistant_id: "diego",
      },
    });

    await wrapper.find("#InputQuestion").setValue("Hola");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(backendApi.post).toHaveBeenCalledWith("/conversation", {
      sessionToken: "session-token",
      sessionId: "session-id",
      message: "Hola",
      counters: "",
    });
    expect(chatterwillyApi.post).not.toHaveBeenCalled();
    expect(wrapper.emitted("messagesent")).toEqual([[true], [false]]);
  });
});
