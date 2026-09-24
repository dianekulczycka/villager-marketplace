import {useContext} from "react";
import {ChatContext} from "../context/chat.context.ts";

export const useChat = () => useContext(ChatContext);