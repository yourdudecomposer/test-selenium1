const { Builder, By, until, Browser } = require('selenium-webdriver');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const { token, chatId, url } = require('./config');

// Ваш Telegram Bot Token и Chat ID

const bot = new TelegramBot(token);
const dataFilePath = 'data.txt';
// Функция для получения данных
async function fetchData() {
    const driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {

        let seenItems = new Set();
        if (fs.existsSync(dataFilePath)) {
            const data = fs.readFileSync(dataFilePath, { encoding: "utf8" });
            seenItems = new Set(data.split("\n").filter(Boolean))
        }


        await driver.get(url);

        const items = await driver.findElements(By.css('[data-marker="item"]'));

        for (const item of items) {
            const nameElement = await item.findElement(By.css('h3, [item-prop="name"]'));
            const priceElement = await item.findElement(By.css('[data-marker="item-price"] span'));
            const urlElement = await item.findElement(By.css('[itemprop="url"]'));

            const name = await nameElement.getText();
            const price = await priceElement.getText();
            const itemUrl = await urlElement.getAttribute('href');

            const itemData = { name, price, itemUrl };


            if (!seenItems.has(itemUrl)) {
                seenItems.add(itemUrl);
                fs.appendFileSync(dataFilePath, itemUrl + '\n');
                // await bot.sendMessage(chatId, `Новое предложение!\nНаименование: ${name}\nЦена: ${price}\nСсылка: ${itemUrl}`);
            }
        }

    } catch (error) {
        console.error('Ошибка во время получения данных:', error);
    } finally {
        await driver.quit();
        await new Promise(resolve => setTimeout(resolve, 5000));
        fetchData()
    }
}


fetchData();
