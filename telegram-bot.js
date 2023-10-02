const token = "6304158730:AAEFEqCH8tnrbI-HRCjuQGC3aYWRklbJqKQ";
const teleUrl = "https://api.telegram.org/bot" + token;
const webAppUrl =
    "https://script.google.com/macros/s/AKfycbwaMX1z_ZvEeVulL1B12oA6lbqvlG2vp_bbhWbDUlWQMuFRdES1yJKGMJdkH83Ut40/exec";

const SSID = "1kn8fAW5g6SKe1hV5Qfh_SVpF8wTNNNsvQw2Q5HdrGyM"; //sub-url spreadsheet
let sheetName = "spending";
dataInit = ["Ngày", "Danh mục", "Giá", "Chi chú", " ", "Tổng"];

function initSheet() {
    const dataLength = dataInit.length;
    if (dataLength == 0) {
        return;
    }

    const sheet = SpreadsheetApp.openById(SSID).getSheetByName(sheetName);
    const checkEmptySheet = sheet.getLastRow();

    // init template
    if (checkEmptySheet == 0) {
        sheet.appendRow(dataInit);

        const greenColor = "#b6d7a8";
        sheet.getRange("A1:D1").setBackground(greenColor);
    }
}

function setWebhook() {
    const url = teleUrl + "/setWebhook?url=" + webAppUrl;
    const response = UrlFetchApp.fetch(url);

    Logger.log(response.getContentText());
}

function doPost(e) {
    const stringJson = e.postData.getDataAsString();
    var updates = JSON.parse(stringJson);
    var id = updates.message.from.id;
    var textBot = updates.message.text;
    var chat_bot = textBot;
    var command_cek = chat_bot.substring(0, 1);
    var command = chat_bot.split(" ")[0]; // command

    if (command_cek == "/") {
        switch (command) {
            case "/start":
                let text1 = "Khởi chạy bot thành công!";
                sendText(id, text1);
                break;
            case "/help":
                let text2 =
                    "*Cú pháp\n" +
                    "Thêm chi tiêu: /add ::danh mục::giá tiền::ghi chú \n" +
                    "BC chi tiêu: /report ::tháng::năm \n";
                sendText(id, text2);
                break;
            case "/add":
                add(updates);
                break;
            case "/report":
                report(updates);
                break;
            default:
                sendText(id, "Lệnh này chưa được thiết lập !!!");
        }
    } else {
        let error = "Lỗi cú pháp!!!";
        sendText(id, error);
    }
}

function add(data) {
    const id = data.message.from.id;
    const text = data.message.text;
    const textArray = text.split("::");

    if (textArray.length !== 4) {
        sendText(id, "Chưa điền đủ thông tin!!!");
        return;
    }

    const now = new Date();
    const time = Utilities.formatDate(now, "GMT+07:00", "dd/MM/yyyy hh:mm:ss"); // format timestamp

    const description = textArray[1];
    const total = textArray[2];
    const note = textArray[3];

    SpreadsheetApp.openById(SSID)
        .getSheetByName(sheetName)
        .appendRow([time, description, total, note]); // input log

    sendText(id, "Chi tiêu đã được lưu lại!");
}

function report(data) {
    const id = data.message.from.id;
    const text = data.message.text;
    textArray = text.split("::");

    if (textArray.length !== 3) {
        sendText(id, "Chưa điền đủ thông tin!!!");
        return;
    }

    const month = textArray[1];
    // const year = textArray[2];
    const total = SpreadsheetApp.openById(SSID)
        .getSheetByName(sheetName)
        .getRange("G1")
        .getValue();

    sendText(id, `Tổng chi tiêu tháng ${month} là: ${total}`);
}

function sendText(chatid, text, replymarkup) {
    const data = {
        method: "post",
        payload: {
            method: "sendMessage",
            chat_id: String(chatid),
            text: text,
            parse_mode: "HTML",
            reply_markup: JSON.stringify(replymarkup),
        },
    };
    UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/", data);
}
