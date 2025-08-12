import OpenAi from "openai";

const openAi = new OpenAi();

function getTimeOfDay(){
    return '2:55'
}

function getOrderStatus(orderId: string) {
    console.log(`Getting the status of orderId ${orderId}`);
    const orderIdAsNum = parseInt(orderId);
    if(orderIdAsNum % 2 === 0){
        return 'In Progress'
    }
    return 'Completed'
}

async function callOpenaiWithTools() {
  const context: OpenAi.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant that gives information about the time of day and order status",
    },
    {
      role: "user",
      content: "What is the status of order 1234?",
    },
  ];

  const response = await openAi.chat.completions.create({
    model: 'gpt-3.5-turbo-1106',
    messages: context,
    tools: [
        {
            type: 'function',
            function: {
                name: 'getTimeOfDay',
                description: 'Get Time of a day'
            }
        },
        {
            type: 'function',
            function: {
                name: 'getOrderStatus',
                description: 'Returns the status of an order',
                parameters: {
                    type: 'object',
                    properties: {
                        orderId: {
                            type: 'string',
                            description: 'The id of the order to get the status of'
                        },
                    },
                    required:['orderId']
                }
            }
        }
    ],
    tool_choice: 'auto'
  });

  console.log(response.choices[0].message.content);

  const WillInvokeFunction = response.choices[0].finish_reason == 'tool_calls'
  const toolCall = response.choices[0].message.tool_calls![0]

  if(WillInvokeFunction){
    const toolName = toolCall.function.name;

    if(toolName == 'getTimeOfDay'){
        const toolResponse = getTimeOfDay();
        context.push(response.choices[0].message);
        context.push({
            role: 'tool',
            content: toolResponse,
            tool_call_id: toolCall.id
        });
    }

    if(toolName == 'getOrderStatus'){
        const rawArgument = toolCall.function.arguments;
        const parsedArguments = JSON.parse(rawArgument);
        const toolResponse = getOrderStatus(parsedArguments.orderId);
        context.push(response.choices[0].message);
        context.push({
            role: 'tool',
            content: toolResponse,
            tool_call_id: toolCall.id
        });
    }
  }

  const secondResponse = await openAi.chat.completions.create({
    model: 'gpt-3.5-turbo-1106',
    messages: context
  })

  console.log(secondResponse.choices[0].message.content)
}


callOpenaiWithTools()