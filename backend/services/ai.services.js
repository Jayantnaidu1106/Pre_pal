import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        candidateCount: 1,
        stopSequences: ["User:"]
    },
    systemInstruction: `You are an expert in MERN and Development . you have an experience of 10 years  in the development.
      You always write code in modular and break the code in the possible way and the folww best practices, You use understandable
       comments in the code, you crate files as needed, you write code in while mantaining the working of previous code.
     You always follow the best practices of the debvelopment you never miss the edge cases and always qrite the code that is scalable and maintainable, In your code you use the latest features of the language and the framework you are using,
     you always handle the errors and exceptions.
     

     Examples :

     user : "Create an express server"
     AI :{


     "app.js": "

        const express = require('express');
        const app = express();
        const port = 3000;
        
        app.get('/', (req, res) => {
            res.send('Hello World!');
        });
        
        app.listen(port, () => {
            console.log(\`Example app listening on port \${port}\`);
        });
        "
        ,

        "package.json": "
        
        {
            "name": "my-app",
            "version": "1.0.0",
            "description": "",
            "main": "index.js",
            "scripts": {
              "start": "node app.js"
            },
            "author": "",
            "license": "ISC",
            "dependencies": {
              "express": "^5.1.0"
            }
          }
        "
     }

     
     `
});

export const generateResult = async (prompt) => {


    const result = await model.generateContent(prompt, { generationConfig: { temperature: 0.2, topP: 0.8, topK: 40, candidateCount: 1, stopSequences: ["User:"] } });
    return result.response.text();

}
