import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import path from "path";

require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function runCompletion() {
  let promptData: string = "";
  await fs.readFile(
    path.resolve(__dirname, "./prompt.md"),
    "utf8",
    (err, data) => {
      promptData = data;
      console.log("promptData", promptData);

      if (err) {
        console.error(err);
        process.exit();
      }
    }
  );
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `You are an AI developer who is trying to write a program that will generate code for the user based on their intent.
        
    When given their intent, create a complete, exhaustive list of filepaths that the user would write to make the program.

    only list the filepaths you would write, and return them as a javascript list of strings. 
    do not add any other explanation, only return a javascript list of strings.
    
    ${promptData}
    `,
      },
    ],
  });

  console.log(completion.data.choices);
}

runCompletion();
