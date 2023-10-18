const token = "";
const teleUrl = "https://api.telegram.org/bot" + token;
const webAppUrl = "";

const dataInit = ["Ngày", "Danh mục", "Giá", "Chi chú", "#Tag", "", "", "Tổng"];
const SSID = ""; //sub-url spreadsheet

const sheetName = createSheetNameByMonthYear();
let spreadsheet = SpreadsheetApp.openById(SSID);
let sheet = spreadsheet.getSheetByName(sheetName);

if (sheet === null) {
  addNewSheet(sheetName);
  sheet = spreadsheet.getSheetByName(sheetName);
}

function initSheet() {
  const sheetTemplateName = "template";
  const sheetTemplate =
    SpreadsheetApp.openById(SSID).getSheetByName(sheetTemplateName);

  if (dataInit.length == 0) {
    return;
  }

  const checkEmptySheet = sheetTemplate.getLastRow();

  // init template
  if (checkEmptySheet == 0) {
    sheetTemplate.appendRow(dataInit);

    const greenColor = "#b6d7a8";
    const pinkColor = "#f4cccc";
    const yellowColor = "#ffe599";

    sheetTemplate.getRange("A1:E1").setBackground(greenColor);
    sheetTemplate.getRange("H1:I1").setBackground(pinkColor);
    sheetTemplate.getRange("F1:G5").setBackground(yellowColor);
    sheetTemplate.getRange("C1:C").setNumberFormat("#,##0 đ");
    sheetTemplate.getRange("I1").setNumberFormat("#,##0 đ");
    sheetTemplate.getRange("A:I").setHorizontalAlignment("left");
  }
}

function addNewSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SSID);

  let indexSheet = spreadsheet.getActiveSheet().getIndex();
  indexSheet += 1;

  spreadsheet.insertSheet(sheetName, indexSheet, {
    template: spreadsheet.getSheetByName("template"),
  });
}

function createSheetNameByMonthYear() {
  let currentDate = new Date();

  return (time = Utilities.formatDate(currentDate, "GMT+07:00", "MM/yyyy"));
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
  const total = sheet.getRange("I1").getValue();

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

  sheet.getRange("I1").setValue(total);
}

function uniqueList() {
  // sheet.getRange("F1").getDataRegion().clearContent()

  const UniqueFormula = "UNIQUE(E:E)";
  sheet.getRange("F1").setFormula(UniqueFormula);

  const UniqueValues = sheet.getRange("F1").getDataRegion().getValues();
  Logger.log(UniqueValues);
  // for (let i = 2; i <= UniqueValues.length; i++) {
  //   let SumifFormula = "Sumif(E:E,F" + i + ",C:C)"
  //   sheet.getRange(i, 6).setFormula(SumifFormula)
  // }
}

function test() {
  const val = SpreadsheetApp.openById(SSID).getSheetByName("18/10/2024");

  Logger.log(val);
}
