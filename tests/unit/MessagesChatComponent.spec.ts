import { shallowMount } from "@vue/test-utils";
import { nextTick } from "vue";
import MessagesChatComponent from "@/components/MessagesChatComponent.vue";
import userAvatar from "@/assets/images/gOr7e1Qaxlh89FlAKz3t.jpg";

const CHATTERWILLY_BOT_AVATAR =
  "https://2.bp.blogspot.com/-8ytYF7cfPkQ/WkPe1-rtrcI/AAAAAAAAGqU/FGfTDVgkcIwmOTtjLka51vineFBExJuSACLcBGAs/s320/31.jpg";
const CHATTERWILLY_USER_AVATAR = "/chatterwilly-user-avatar.svg";

describe("MessagesChatComponent", () => {
  const createEmitterStub = () => {
    const listeners: Record<string, (...args: unknown[]) => void> = {};
    const emitter = {
      on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
        listeners[event] = handler;
      }),
    };

    return { emitter, listeners };
  };

  it("renders chatterwilly messages with the default avatars", async () => {
    const { emitter, listeners } = createEmitterStub();

    const wrapper = shallowMount(MessagesChatComponent, {
      props: {
        history_messages: [],
        reset_token: 0,
        assistant_id: "chatterwilly",
      },
      global: {
        config: {
          globalProperties: {
            emitter,
          },
        },
      },
    });

    listeners.messagesent("Hola");
    listeners.messagesSendBot({ sessionId: "abc", answers: ["Respuesta 1"] });

    await nextTick();

    const wrappers = wrapper.findAll(".message-wrapper");
    expect(wrappers).toHaveLength(2);
    expect(
      wrapper.find(".message-wrapper.user-message .msg_cotainer_send").text()
    ).toBe("Hola");
    expect(
      wrapper.find(".message-wrapper.user-message img").attributes("src")
    ).toBe(CHATTERWILLY_USER_AVATAR);
    expect(
      wrapper.find(".message-wrapper.bot-message .msg_cotainer").text()
    ).toBe("Respuesta 1");
    expect(
      wrapper.find(".message-wrapper.bot-message img").attributes("src")
    ).toBe(CHATTERWILLY_BOT_AVATAR);
    expect(wrapper.find(".message-wrapper.user-message img").exists()).toBe(
      true
    );
    expect((wrapper.vm as { showTyping: boolean }).showTyping).toBe(false);
  });

  it("supports multiple chatterwilly messages without losing the send flow", async () => {
    const { emitter, listeners } = createEmitterStub();

    const wrapper = shallowMount(MessagesChatComponent, {
      props: {
        history_messages: [],
        reset_token: 0,
        assistant_id: "chatterwilly",
      },
      global: {
        config: {
          globalProperties: {
            emitter,
          },
        },
      },
    });

    listeners.messagesent("Primero");
    listeners.messagesSendBot({ sessionId: "abc", answers: ["Respuesta 1"] });
    listeners.messagesent("Segundo");
    listeners.messagesSendBot({ sessionId: "abc", answers: ["Respuesta 2"] });

    await nextTick();

    expect(wrapper.findAll(".message-wrapper")).toHaveLength(4);
    expect(wrapper.text()).toContain("Primero");
    expect(wrapper.text()).toContain("Segundo");
    expect(wrapper.text()).toContain("Respuesta 1");
    expect(wrapper.text()).toContain("Respuesta 2");
    expect((wrapper.vm as { showTyping: boolean }).showTyping).toBe(false);
  });

  it("renders diego with the swapped avatars", async () => {
    const { emitter, listeners } = createEmitterStub();

    const wrapper = shallowMount(MessagesChatComponent, {
      props: {
        history_messages: [],
        reset_token: 0,
        assistant_id: "diego",
      },
      global: {
        config: {
          globalProperties: {
            emitter,
          },
        },
      },
    });

    listeners.messagesent("Hola");
    listeners.messagesSendBot({
      sessionId: "abc",
      answers: [],
      response: "Respuesta de Diego",
    });

    await nextTick();

    expect(
      wrapper.find(".message-wrapper.bot-message .msg_cotainer").text()
    ).toBe("Respuesta de Diego");
    expect(
      wrapper.find(".message-wrapper.user-message .msg_cotainer_send").text()
    ).toBe("Hola");
    expect(
      wrapper.find(".message-wrapper.user-message img").attributes("src")
    ).toBe(CHATTERWILLY_USER_AVATAR);
    expect(
      wrapper.find(".message-wrapper.bot-message img").attributes("src")
    ).toBe(userAvatar);
  });
});
