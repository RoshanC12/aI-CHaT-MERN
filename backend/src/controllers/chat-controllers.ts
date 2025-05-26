import { Request, Response, NextFunction } from "express";
import User from "../models/user-model.js";
import openai from "../configs/open-ai-config.js";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Generate chat response using OpenAI
export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message } = req.body;

    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json("User not registered / token malfunctioned");
    }

    // Format previous chats for OpenAI API
    const chats: ChatCompletionMessageParam[] = user.chats
      .filter(chat => ["user", "assistant", "system"].includes(chat.role))
      .map(({ role, content }) => ({
        role: role as "user" | "assistant" | "system",
        content,
      }));

    // Add the latest user message
    chats.push({ role: "user", content: message });

    // Store user message in DB
    user.chats.push({ role: "user", content: message });

    // Call OpenAI
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chats,
    });

    // Append OpenAI's response to user's chat
    if (!chatResponse.choices || !chatResponse.choices[0]?.message) {
      return res.status(500).json({ message: "Invalid OpenAI response" });
    }
    const reply = chatResponse.choices[0].message;
    user.chats.push(reply);
    await user.save();

    return res.status(200).json({ chats: user.chats });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Get all chats for a user
export const getAllChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res.status(401).json({
        message: "ERROR",
        cause: "User doesn't exist or token malfunctioned",
      });
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res
        .status(401)
        .json({ message: "ERROR", cause: "Permissions didn't match" });
    }

    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ message: "ERROR", cause: err.message });
  }
};

// Delete all chats for a user
export const deleteAllChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res.status(401).json({
        message: "ERROR",
        cause: "User doesn't exist or token malfunctioned",
      });
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res
        .status(401)
        .json({ message: "ERROR", cause: "Permissions didn't match" });
    }

    user.chats = [];
    await user.save();

    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ message: "ERROR", cause: err.message });
  }
};
