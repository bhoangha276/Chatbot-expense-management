const token = "";
const teleUrl = "https://api.telegram.org/bot" + token;
const webAppUrl = "";

const dataInit = ["Ngày", "Danh mục", "Giá", "Chi chú", " ", "Tổng"];
const SSID = ""; //sub-url spreadsheet
let sheetName = "";
const sheet = SpreadsheetApp.openById(SSID).getSheetByName(sheetName);

function initSheet() {
    const dataLength = dataInit.length;
    if (dataLength == 0) {
        return;
    }

    const checkEmptySheet = sheet.getLastRow();

    // init template
    if (checkEmptySheet == 0) {
        sheet.appendRow(dataInit);

        const greenColor = "#b6d7a8";
        const yellowColor = "#ffe599";
        sheet.getRange("A1:D1").setBackground(greenColor);
        sheet.getRange("F1:G1").setBackground(yellowColor);
        sheet.getRange("C1:C").setNumberFormat("#,##0 đ");
        sheet.getRange("G1").setNumberFormat("#,##0 đ");
        sheet.getRange("A:G").setHorizontalAlignment("left");
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
                initSheet();
                let text1 =
                    "Thiết lập bot thành công! Gõ '/help' để xem gợi ý các lệnh.";
                sendText(id, text1);
                break;
            case "/help":
                let text2 =
                    "*Cú pháp\n" +
                    "Thiết lập cài đặt bot: /start\n" +
                    "Thêm chi tiêu: /add *danh mục*giá tiền*ghi chú \n" +
                    "BC chi tiêu: /report *tháng*năm \n";
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
    const textArray = text.split("*");

    if (textArray.length < 3) {
        sendText(id, "Chưa điền đủ thông tin!!!");
        return;
    }

    const description = textArray[1];
    const total = textArray[2];
    const note = textArray[3];

    if (isNaN(total)) {
        sendText(id, "Giá tiền phải điền là số!!!");
        return;
    }

    const now = new Date();
    const time = Utilities.formatDate(now, "GMT+07:00", "dd/MM/yyyy hh:mm:ss"); // format timestamp

    sheet.appendRow([time, description, total * 1000, note]); // input log

    const lastRow = sheet.getLastRow();

    sheet.getRange("C" + lastRow);

    sendText(id, "Chi tiêu đã được lưu lại!");

    calculateTotal();
}

function report(data) {
    const id = data.message.from.id;
    const text = data.message.text;
    textArray = text.split("*");

    if (textArray.length < 2) {
        sendText(id, "Chưa điền đủ thông tin!!!");
        return;
    }

    const month = textArray[1];
    // const year = textArray[2];
    const total = sheet.getRange("G1").getValue();

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
    UrlFetchApp.fetch(teleUrl + "/", data);
}

function calculateTotal() {
    const lastRow = sheet.getLastRow();
    const values = sheet.getRange("C2:C" + lastRow).getValues();
    let total = 0;

    for (let i = 0; i < lastRow - 1; i++) {
        total += values[i][0];
    }

    sheet.getRange("G1").setValue(total);
}

function test() {
    const lastRow = sheet.getLastRow();
    const val = sheet.getRange("C2:C" + lastRow).getValues();
    Logger.log(val);
}
