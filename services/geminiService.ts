import { GoogleGenAI } from "@google/genai";
import { Transaction, Subscription, TransactionType, Currency, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (
  transactions: Transaction[],
  subscriptions: Subscription[],
  language: Language
): Promise<string> => {
  
  // Prepare data summary for the prompt
  const recentTransactions = transactions.slice(0, 20); // Limit to last 20 for context
  const income = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);
  
  const subTotal = subscriptions.reduce((acc, s) => acc + s.price, 0);

  // Localization for prompt
  const langPrompt = {
    ru: { context: 'Валюта: Польский Злотый (PLN)', goal: 'Отвечай на русском языке. Тон дружелюбный.' },
    en: { context: 'Currency: Polish Zloty (PLN)', goal: 'Answer in English. Friendly tone.' },
    pl: { context: 'Waluta: Polski Złoty (PLN)', goal: 'Odpowiadaj po polsku. Ton przyjazny.' }
  };

  const currentLang = langPrompt[language] || langPrompt.ru;

  const dataContext = `
    ${currentLang.context}
    
    Current Balance:
    Income: ${income}
    Expense: ${expense}
    
    Active Subscriptions (Total ${subTotal} / mo):
    ${subscriptions.map(s => `- ${s.name}: ${s.price} (billed on day ${s.billingDate})`).join('\n')}

    Recent Transactions:
    ${recentTransactions.map(t => `- ${t.date.split('T')[0]}: ${t.type === 'INCOME' ? '+' : '-'}${t.amount} (${t.category}) - ${t.title}`).join('\n')}
  `;

  const prompt = `
    You are an expert financial advisor. Analyze the user data.
    
    Data:
    ${dataContext}
    
    Task:
    Give 1 specific, helpful, and concise tip to optimize the budget.
    Focus on subscriptions if there are many, or big expense categories.
    
    Requirements:
    - ${currentLang.goal}
    - Use emojis.
    - Max 3 sentences.
    - Bold key numbers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "AI response empty.";
  } catch (error) {
    console.error("Error generating advice:", error);
    return language === 'en' ? "Connection error." : (language === 'pl' ? "Błąd połączenia." : "Ошибка соединения.");
  }
};
