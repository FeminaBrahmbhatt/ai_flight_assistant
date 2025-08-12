import OpenAI from "openai";

const openai = new OpenAI();

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

const context: ChatMessage[] = [
  {
    role: "system",
    content:
      "You are a helpful assistant who has all the information about the flights from depart to destination.",
  },
];

const functionsRegistry = {
  getFlightsFrom: {
    description: "Get all flights from depart to destination",
    parameters: {
      type: "object",
      properties: {
        depart: { type: "string", description: "Depart location code" },
        destination: { type: "string", description: "Destination location code" },
      },
      required: ["depart", "destination"],
    },
    implementation: (args: { depart: string; destination: string }): string[] => {
      console.log("Getting available flights");
      if (args.depart === "SFO" && args.destination === "LAX") {
        return ["UA 123", "AA 456"];
      } else if (args.depart === "DFW" && args.destination === "LAX") {
        return ["AA 789"];
      }
      return ["66 FSFG"];
    },
  },

  getReservationFrom: {
    description: "Get reservation for a flight number",
    parameters: {
      type: "object",
      properties: {
        flightNum: { type: "string", description: "Flight number" },
      },
      required: ["flightNum"],
    },
    implementation: (args: { flightNum: string }): string => {
      if (args.flightNum.length === 6) {
        console.log(`Reserving flight ${args.flightNum}`);
        return "123456";
      }
      return "Fully booked";
    },
  },
} as const;

type FunctionName = keyof typeof functionsRegistry;

const tools = Object.entries(functionsRegistry).map(([name, fn]) => ({
  type: "function" as const,
  function: {
    name,
    description: fn.description,
    parameters: fn.parameters,
  },
}));

async function callOpenAiFlightAssistantWithFunction() {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: context,
    temperature: 0,
    tools,
    tool_choice: "auto",
  });

  const toolCall = response.choices[0].message.tool_calls?.[0];
  if (toolCall) {
    const toolName = toolCall.function.name as FunctionName;
    const parsedArguments = JSON.parse(toolCall.function.arguments);

    context.push(response.choices[0].message);

    const result = functionsRegistry[toolName].implementation(parsedArguments);

    context.push({
      role: "tool",
      content: JSON.stringify(result),
      tool_call_id: toolCall.id,
    });

    const secondResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: context,
    });

    console.log(secondResponse.choices[0].message.content);
  }
}

console.log("Welcome to flight assistant chatbot!");
process.stdin.addListener("data", async function (input: string) {
  const userInput = input.toString().trim();
  context.push({ role: "user", content: userInput });
  await callOpenAiFlightAssistantWithFunction();
});
