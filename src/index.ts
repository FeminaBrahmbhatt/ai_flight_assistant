import { describe } from 'node:test';
import OpenAi from 'openai'
import { parse } from 'path';

const openai = new OpenAi();

const context: OpenAi.Chat.Completions.ChatCompletionMessageParam[] = [
    {
        role: 'system',
        content: 'You are a helful assistant who is having all the information about the flights from depart to destination.'
    }
]

function getFlightsFrom(depart:string, destination:string): string[]{
    console.log('Getting available flights')
    if(depart === 'SFO' && destination === 'LAX'){
        return ['UA 123', 'AA 456'];
    }
    else if(depart === 'DFW' && destination === 'LAX'){
        return ['AA 789'];
    }

    return ['66 FSFG'];
}

function getReservationFrom(flightNum:string): string | 'FullyBooked' {
    if(flightNum.length === 6){
        console.log(`Reserving flight ${flightNum}`);
        return '123456';
    }
    return 'Fully booked'
}

async function callOpenAiFlightAssistantWithFunction(){
    let response = await openai.chat.completions.create({
        model:'gpt-3.5-turbo-1106',
        messages: context,
        temperature:0.0,
        tools:[
            {
                type:'function',
                function:{
                    name:'getFlightsFrom',
                    description:'To get all the flights from depart to destination',
                    parameters:{
                        type:'object',
                        properties:{
                            depart:{
                                type: 'string',
                                description:'The string of depart location.'
                            },
                            destination:{
                                type: 'string',
                                description: 'The string of destination location.'
                            }
                        },
                        required:['depart', 'destination']
                    }
                }
            },
            {
                type:'function',
                function:{
                    name:'getReservationFrom',
                    description:'To get reservation of flight number',
                    parameters:{
                        type:'object',
                        properties:{
                            flightNum:{
                                type: 'string',
                                description:'The string of flight number.'
                            },
                        },
                        required:['flightNum']
                    }
                }
            }
        ],
        tool_choice:'auto'
    });

    const willInvokeFunctionCall = response.choices[0].finish_reason;
    const toolCall = response.choices[0].message.tool_calls![0];

    if(willInvokeFunctionCall){
        const toolName = toolCall.function.name;
        
        if(toolName === 'getFlightsFrom'){
            const rawArguments = toolCall.function.arguments;
            const parsedArguments = JSON.parse(rawArguments);
            context.push(response.choices[0].message);
            let flights = getFlightsFrom(parsedArguments.depart, parsedArguments.destination);
            context.push({
                role: 'tool',
                content: flights.toString(),
                tool_call_id: toolCall.id
            })
        }

        if(toolName === 'getReservationFrom'){
            const rawArguments = toolCall.function.arguments;
            const parsedArguments = JSON.parse(rawArguments);
            context.push(response.choices[0].message);
            let reservation = getReservationFrom(parsedArguments.flightNum);
            context.push({
                role: 'tool',
                content: reservation,
                tool_call_id: toolCall.id
            })
        }
    }


    const secondResponse = await openai.chat.completions.create({
        model:'gpt-3.5-turbo-1106',
        messages: context
    })

    console.log(secondResponse.choices[0].message.content);
}

console.log('Welcome to flight assistant chatbot!')
process.stdin.addListener("data", async function name(input: string){
    const userInput = input.toString().trim();
    context.push({
        role: 'assistant',
        content: userInput
    });
    await callOpenAiFlightAssistantWithFunction();
})
