import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionResponse, OpenAIApi } from "openai";
import fs from "fs";
import path from "path";
import { AxiosResponse } from "axios";

require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const outputPath = path.resolve(__dirname, "../build/");
const indexFilePath = path.resolve(outputPath, "index.html");

const complete = async (fileName: string, ...completionParams: Parameters<typeof openai.createChatCompletion>): Promise<string> => {
  const filePath = path.resolve(outputPath, fileName);

  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, { encoding: "utf-8" });
  }

  const completion = await openai.createChatCompletion(...completionParams);

  const output = completion.data.choices[0].message?.content ?? "";

  fs.writeFileSync(filePath, output, { encoding: "utf-8" });

  return output;
}

async function runCompletion() {
  const promptData: string = `
    a web application that teaches long hand division
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

  // Specs (PM)
  const spec = await complete("spec.md", {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an AI product manager that is building ${promptData}.

        The end user of the application is a student and his intent is to learn long hand division using the application.
      
        Be specific about the features that will help the student understand all the different terms in a division problem. An example of a feature could be that when the student hovers over a number, it tells them what that number represents.
      
        Remember there are a few limitations:
        - Any visual in the application should be created with CSS. No image files are allowed.
        - It should include a brief explanation of the topic and it should aid the student to understand the topic better.
        - The scope of the application is small and therefore it must be a simple application.
        - It MUST be interactive like a game
        - It MUST provide feedback on the user input
      
        Use markdown format.
        `
      },
      {
        role: "user",
        content: "Begin generating the document now.",
      }
    ],
  });

  console.log({ spec })

  // UX researcher (Interactions)
  const ux = await complete("ux.md", {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a UX researcher working on ${promptData}.

        Given the detailed specification document delimited by tripple backticks, create a complete, exhaustive list of interactions

        \`\`\`
        ${spec}
        \`\`\`

        Use markdown format.
        `
      },
      {
        role: "user",
        content: "Begin generating the document now.",
      }
    ],
  });

  console.log({ ux })

  // UI designer (Layout)
  const ui = await complete("ui.md", {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a UI designer working on ${promptData}.

        Given the detailed specification document delimited by tripple backticks, create a document detailing the layout for the application, including how each element should look like and where on the screen they should be displayed.

        \`\`\`
        ${spec}
        \`\`\`

        Use markdown format.
        `
      },
      {
        role: "user",
        content: "Begin generating the document now.",
      }
    ],
  });

  console.log({ ui })

  const template = await complete("template.html", {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an AI web developer who is trying to write a program that will generate code for the user based on their intent.

        ---
        the app is: ${promptData}
        ---

        Your job is to generate the html code for the app based on a description of the layout below in tripple backticks.

        \`\`\`
        ${ui}
        \`\`\`

        Do not create any JavaScript code. Only output minimal HTML and CSS code.
        `,
      },
      {
        role: "user",
        content: "Begin generating the code now.",
      }
    ]
  });

  console.log({ template })

  // User Stories (PM)
  const stories = await complete("stories.json", {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `You are an AI product manager that is building ${promptData}.

        The end user of the application is a student and his intent is to learn long hand division using the application.

        Given the detailed specification document delimited by tripple backticks, create a complete, exhaustive list of user stories for a web developer to work on.

        Each user story should:
        1. Not interfere with other user stories
        2. Have a clear definition of done
        3. Include a list of functional requirements to accomplish the goals defined in the specification document delimited by tripple backticks

        \`\`\`
        ${spec}
        \`\`\`

        The output format should be a JSON object with the following format:

        {
          stories: [
            {
              title: <user story title>,
              description: <user story description>
              functionalRequirements: [
                "<requirement 1>",
                "<requirement 2>"
              ]
            }
          ]
        }
        `
      },
    ],
  });

  console.log({ stories })

  const storiesArray = JSON.parse(stories).stories;

  console.log({ storiesArray })

  let indexFile = template;

  // Web Developer
  for (const story of storiesArray) {
    let storyCompletion: AxiosResponse<CreateChatCompletionResponse, any>;
    let output = '';

    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `You are an AI web developer who is trying to write a program that will generate code for the user based on their intent.

          ---
          the app is: ${promptData}
          ---

          the file we have decided to generate is named index.html and it already has the following content delimited by triple backticks.

          \`\`\`
          ${indexFile}
          \`\`\`

          Do not reference any external files.
        `,
      },
      {
        role: "system",
        content: `
          I want you to act as a software developer. Your job is to generate the code for the index.html file to fulfill the following user story:
          - Title: ${story.title}
          - Description: ${story.description}
          - Functional Requirements:
            ${story.functionalRequirements.map((req: string) => `- ${req}\n`)}

          Remember that you must obey the following rules at all cost: 
          1. only output the contents for the index.html file and return only the code.
          2. the purpose of our app is to be: \`\`\`${promptData}\`\`\`. Every line of code you generate must be valid code.
          3. Placeholders or "coming soon" features are not acceptable.
          4. Do not delete any CSS classes, HTML tags, including script HTML tags.
          5. You will never show just the comment of the code like "code goes here", instead you will type that part of the code that is needed to complete the code.
          6. Do not add any explanation. Just output the code.
          `,
      },
      {
        role: "user",
        content: "Begin generating the code now.",
      }
    ];
    
    do {
      storyCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
      });

      const message = storyCompletion.data.choices[0].message;

      if (message) {
        output += message?.content ?? '';
        
        messages.push(message);
      }

      if (storyCompletion.data.choices[0].finish_reason === 'length') {
        messages.push({
          role: "user",
          content: "Continue"
        });
      }
    } while (storyCompletion.data.choices[0].finish_reason === 'length');

    indexFile = output;

    console.log({ story, output })
  }

  fs.writeFileSync(indexFilePath, indexFile, { encoding: "utf-8" });


  // const filePathsUserMessage = `You are an AI developer who is trying to write a program that will generate code for the user based on their intent.

  // When given their intent and a detailed specification document, create a complete, exhaustive list of filepaths that the user would write to make the program.

  // Do not use image or audio files.

  // Do not create folders nor add folders to the file paths.

  // only list the filepaths you would write, and return them as a javascript list of strings. 
  // do not add any other explanation, only return a javascript list of strings.

  // ---
  // the app is: ${promptData}
  // ---
  // the specification is: ${spec}
  // ---
  // `;

  // const filePathsCompletion = await openai.createChatCompletion({
  //   model: "gpt-3.5-turbo",
  //   messages: [
  //     {
  //       role: "user",
  //       content: filePathsUserMessage,
  //     },
  //   ],
  // });

  // const stringFilePaths = filePathsCompletion.data.choices[0].message?.content;
  // const filePaths = stringFilePaths ? JSON.parse(stringFilePaths) : [];
  // console.log({ filePaths });

  // const sharedDependenciesUserMessage = `You are an AI developer who is trying to write a program that will generate code for the user based on their intent.

  // In response to the user"s prompt:

  // ---
  // the app is: ${promptData}
  // ---
  // the specification is: ${spec}
  // ---

  // the files we have decided to generate are: ${filePaths.join(", ")}

  // Now that we have a list of files, we need to understand what dependencies they share.
  // Please name and briefly describe what is shared between the files we are generating, including exported variables, data schemas, id names of every DOM elements that javascript functions will use, message names, and function names.
  // Exclusively focus on the names of the shared dependencies, and do not add any other explanation.
  // `

  // const sharedDependenciesCompletion = await openai.createChatCompletion({
  //   model: "gpt-3.5-turbo",
  //   messages: [
  //     {
  //       role: "user",
  //       content: sharedDependenciesUserMessage,
  //     }
  //   ]
  // })

  // const sharedDependencies = sharedDependenciesCompletion.data.choices[0].message?.content;
  // console.log({ sharedDependencies })


  // for (const filePath of filePaths) {
  // const fileCreationCompletion = await openai.createChatCompletion({
  //   model: "gpt-3.5-turbo",
  //   messages: [
  //     // ...pastAssistantMessages,
  //     {
  //       role: "system",
  //       content: `You are an AI developer who is trying to write a program that will generate code for the user based on their intent.

  //         ---
  //         the app is: ${promptData}
  //         ---
  //         the specification is: ${spec}
  //         ---

  //         the file we have decided to generate is named index.html and it has the following template:

  //         \`\`\`
  //         <!DOCTYPE html>
  //         <html>
  //         <head>
  //             <title>App</title>
  //             <style>
  //               /* Styles */
  //             </style>
  //         </head>
  //         <body>
  //             <!-- HTML Tags -->
  //             <script>
  //               /* Script */
  //             </script>
  //         </body>
  //         </html>
  //         \`\`\`

  //         Do not reference any external files.
  //       `,
  //     },
  //     {
  //       role: "user",
  //       content: `
  //         I want you to act as a software developer. Your job is to generate the code for the index.html file by following the specification as closely as possible.

  //         Take the following steps:
  //         1. Replace "<!-- HTML Tags -->" with all of the HTML code needed
  //         2. Replace "/* Script */" with all of the JavaScript code needed. Remember the generated JavaScript code must reference only elements created in step 1
  //         3. Replace "/* Styles */" with all of the CSS code needed to style the HTML elements created in step 1. Remember the generated CSS code must reference only elements created in step 1.

  //         Remember that you must obey the following rules at all cost: 
  //         1. you are generating code for the file index.html
  //         2. do not stray from the template we have decided on
  //         3. only write valid code for index.html, and return only the code
  //         4. only output the contents for the index.html file after all the changes were made to the template.
  //         5. the purpose of our app is to be: \`\`\`${promptData}\`\`\`. Every line of code you generate must be valid code.
  //         6. - MOST IMPORTANT OF ALL - do NOT rush into conclusion. take your time to fulfill all of the items described in the specification one by one. Placeholders or "coming soon" features are not acceptable.

  //         Begin generating the code now.
  //         `,
  //     }
  //   ],
  // });

  // const indexFileContent = fileCreationCompletion.data.choices[0].message?.content ?? "";
  // console.log(fileCreationCompletion.data.choices);

  // const indexOutputPath = path.resolve(__dirname, "../build/index.html");
  // fs.closeSync(fs.openSync(indexOutputPath, "w"))
  // fs.writeFileSync(indexOutputPath, indexFileContent, { encoding: "utf-8" });
  // }
}

runCompletion();
