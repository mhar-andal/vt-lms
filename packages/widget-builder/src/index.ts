import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import fs from "fs";
import path from "path";

require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function runCompletion() {
  let promptData: string = `
    an app that teaches long hand division
  `;
  // await fs.readFile(
  //   path.resolve(__dirname, "./prompt.md"),
  //   "utf8",
  //   (err, data) => {
  //     promptData = data;
  //     console.log("promptData", promptData);

  //     if (err) {
  //       console.error(err);
  //       process.exit();
  //     }
  //   }
  // );

  const specCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `You are an AI product manager that is building an app that teaches long hand division. Be specific about the features that will help the student understand all the different terms in a division problem. An example of a feature could be that when the student hovers over a number, it tells them what that number represents.
        `
      }
    ]
  })

  const spec = specCompletion.data.choices[0].message?.content;
  console.log({ spec })

  const filePathsCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `You are an AI developer who is trying to write a program that will generate code for the user based on their intent.
        
        When given their intent and a detailed specification document, create a complete, exhaustive list of filepaths that the user would write to make the program.

        Do not use image or audio files.

        Do not create folders or add folders to the file paths.

        only list the filepaths you would write, and return them as a javascript list of strings. 
        do not add any other explanation, only return a javascript list of strings.
    
        ---
        the app is: ${promptData}
        ---
        the specification is: ${spec}
        ---
    `,
      },
    ],
  });

  const stringFilePaths = filePathsCompletion.data.choices[0].message?.content;
  const filePaths = stringFilePaths ? JSON.parse(stringFilePaths) : [];
  console.log({ filePaths });

  const sharedDependenciesCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `You are an AI developer who is trying to write a program that will generate code for the user based on their intent.

        In response to the user's prompt:

        ---
        the app is: ${promptData}
        ---

        the files we have decided to generate are: ${filePaths.join(', ')}

        Now that we have a list of files, we need to understand what dependencies they share.
        Please name and briefly describe what is shared between the files we are generating, including exported variables, data schemas, id names of every DOM elements that javascript functions will use, message names, and function names.
        Exclusively focus on the names of the shared dependencies, and do not add any other explanation.
        `,
      }
    ]
  })

  const sharedDependencies = sharedDependenciesCompletion.data.choices[0].message?.content;
  console.log({ sharedDependencies })

  const pastAssistantMessages: ChatCompletionRequestMessage[] = [];

  for (const filePath of filePaths) {
    const fileCreationCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        ...pastAssistantMessages,
        {
          role: "system",
          content: `You are an AI developer who is trying to write a program that will generate code for the user based on their intent.
          
          ---
          the app is: ${promptData}
          ---
          the specification is: ${spec}
          ---
  
          the files we have decided to generate are: ${filePaths.join(', ')}

          the shared dependencies (like filenames and variable names) we have decided on are: ${sharedDependencies}
  
          only write valid code for the given filepath and file type, and return only the code.
          do not add any other explanation, only return valid code for that file type.
        `,
        },
        {
          role: "user",
          content: `We have broken up the program into per-file generation.
          Now your job is to generate only the code for the file ${filePath}.
          Make sure to have consistent filenames if you reference other files we are also generating.

          Remember that you must obey 3 things: 
            - you are generating code for the file ${filePath}
            - do not stray from the names of the files and the shared dependencies we have decided on
            - MOST IMPORTANT OF ALL - the purpose of our app is ${promptData} - every line of code you generate must be valid code. Do not include code fences in your response, for example
          
          Bad response:
          \`\`\`javascript 
          console.log("hello world")
          \`\`\`
          
          Good response:
          console.log("hello world")
          
          Begin generating the code now.
          `,
        }
      ],
    });

    console.log(fileCreationCompletion.data.choices);

    const assistantMessages: ChatCompletionRequestMessage[] =
      fileCreationCompletion.data.choices.map((choice) => ({
        role: 'assistant',
        content: choice.message?.content ?? '',
      }));

    pastAssistantMessages.push(...assistantMessages);
  }
}

runCompletion();
