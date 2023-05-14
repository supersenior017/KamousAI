import { type PreferencesT, type ResType } from "@/hooks";
import {
  type ChatGPTMessage,
  openaiStreamParser,
  type OpenAIStreamPayload,
} from "@/utils/openai-stream-parser";

export const config = {
  runtime: "edge",
};
const systemMessages = {
  definition: [
    "Act as a dictionary. Follow the following rules strictly:\n",
    "* Be concise with your answer\n",
    "* Use emoji if it represent the meaning\n",
    "* Do not mention this phrase ever 'As an AI language model'\n",
    "* if no context specified, use general context\n",
    "* Do not ignore or skips these rules ever\n",
  ],
  examples: [
    "Act as a dictionary. Follow the following rules strictly:\n",
    "* Do not explain the examples, that you should provide\n",
    "* Use bullets format\n",
    "* if no context specified, use general context\n",
  ],
  synonyms: ["Act as a dictionary. Follow the following rules strictly:\n", ""],
  anatonyms: [
    "Act as a dictionary. Follow the following rules strictly:\n",
    "",
  ],
  related: [
    "Act as a dictionary. Follow the following rules strictly:\n",
    "Be concise with your answer\n",
    "* Use emoji if it represent the meaning\n",
  ],

};
interface Options extends PreferencesT {
  keyword: ResType
}
const getMessages = (messages: ChatGPTMessage[], options: Options) => {
  const { keyword, mode = "mono", inputLanguage, outputLanguage } = options
  const outputLang = mode == "bili" ? `* Generate response in the following language ${outputLanguage}` : `* Generate response in the following language ${inputLanguage}`

  const term = messages[0]?.content as string;
  const systemInstructions = {
    role: "system",
    content: systemMessages[keyword].join("") + outputLang,
  };
  switch (keyword) {
    case "definition": {
      if (mode === "mono") {
        return [
          systemInstructions,
          {
            role: "user",
            content: `Explain "${term}"`,
          },
        ];
      } else {
        return [
          systemInstructions,
          {
            role: "user",
            content: `Translate the following "${term}" from ${inputLanguage} to ${outputLanguage}`,
          },
        ];
      }
    }
    case "examples":
      return [
        systemInstructions,
        {
          role: "user",
          content: `List 3 examples of the following "${term}"`,
        },
      ];
    case "synonyms":
      return [
        systemInstructions,
        {
          role: "user",
          content: `Generate not greater than 5 synonyms of the following "${term}"`,
        },
      ];
    case "anatonyms":
      return [
        systemInstructions,
        {
          role: "user",
          content: `Generate not greater than 5 anatonyms of the following "${term}"`,
        },
      ];
    case "related":
      return [
        systemInstructions,
        {
          role: "user",
          content: `What is the tone of the word "${term}"? and where it can be used?`,
        },
      ];
    default:
      return [
        {
          role: "user",
          content: term,
        },
      ];
  }
};
const handler = async (req: Request): Promise<Response> => {
  const {
    messages,
    keyword,
    temperature = 0.2,
    max_tokens = 150,
    preferences
  } = await req.json();

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: getMessages(messages, { keyword, ...preferences }),

    stream: true,
    temperature,
    max_tokens,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    n: 1,
  };

  const stream = await openaiStreamParser(payload);
  return new Response(stream);
};

export default handler;
