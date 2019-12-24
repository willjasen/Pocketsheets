// Global variables
//
// These should be changed!
var apiKey = "";
//
// These are okay
var url = "https://api.pocketsmith.com/v2";
var userID = fetch("/me").id;
var accounts = fetch("/users/"+userID+"/accounts");
var per_page = 100;
//

// Run reports when the sheet is opened
function onOpen(e) {
  VariableUtilitiesReport();
  AccountReport();
}

function VariableUtilitiesReport()
{
  // Sheet details
  var sheetName = "Variable Utilities"; 
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  
  // Display variable monthly bills
  var row = 1;
  sheet.getRange(row,1).setValue("Payee");
  sheet.getRange(row,2).setValue("Amount");
  sheet.getRange(row,3).setValue("# of Transactions");
  sheet.getRange(row,4).setValue("Average");
  sheet.getRange(row,5).setValue("Standard Deviation");
  row++;
  
  while (sheet.getRange(row,1).getValue()) {
    var payee = sheet.getRange(row,1).getValue();;
    var payeeRow = getPayeeRow(payee);
    var column = 2;
    for each(var attribute in payeeRow) {
      sheet.getRange(row,column).setValue(attribute);
      column++;
    }
    row++;
  }
}

function AccountReport()
{
  // Sheet details
  var sheetName = "Accounts";
  var cells = "A2:Z100";
  
  // Clear the existing content
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getRange(cells).clearContent();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  
  var assets = ["bank","cash","other_assets","property","vehicle"];
  var liabilities = ["credits","loans","other_liability","mortgage"];
  var investments = ["stocks"];
  //var property = ["property","vehicle"];
  var others = [""];
  
  // Display accounts 
  var row = 1;
  sheet.getRange(row,1).setValue("Assets");
  sheet.getRange(row,4).setValue("Liabilities");
  sheet.getRange(row,7).setValue("Investments")
  sheet.getRange(row,10).setValue("Other");
  row++;
  
  // Display assets
  for each(var account in accounts) {
    var column = 1;
    if(assets.indexOf(account.type)!=-1) {
      sheet.getRange(row,column).setValue(account.title);
      column++;
      sheet.getRange(row,column).setValue(account.current_balance);
      sheet.getRange(row,column).setFontColor("green");
      row++
    }
  }
  
  // Display liabilities
  row = 2;
  for each(var account in accounts) {
    var column = 4;
    if(liabilities.indexOf(account.type)!=-1) {
      sheet.getRange(row,column).setValue(account.title);
      column++;
      sheet.getRange(row,column).setValue(account.current_balance*-1);
      sheet.getRange(row,column).setFontColor("red");
      row++;
    }
  }
  
  // Display investments
  row = 2;
  for each(var account in accounts) {
    var column = 7;
    if(investments.indexOf(account.type)!=-1) {
      sheet.getRange(row,column).setValue(account.title);
      column++;
      sheet.getRange(row,column).setValue(account.current_balance);
      sheet.getRange(row,column).setFontColor("blue");
      row++;
    }
  }
  
  // Display others
  row = 2;
  for each(var account in accounts) {
    var column = 10;
    if(others.indexOf(account.type)!=-1) {
      sheet.getRange(row,column).setValue(account.title);
      column++;
      sheet.getRange(row,column).setValue(account.current_balance);
      row++;
    }
  }
}

function getPayeeRow(payee) {
  var payeeRow = new Array();
  var totalAmount = 0;
  var transactions = fetch("/users/"+userID+"/transactions?per_page="+per_page+"&search="+payee);
  var stdDev = new Array();
  
  // Calculate total amount, # of transactions, average, and standard deviation
  for each(var transaction in transactions) {
    totalAmount += transaction.amount;
    stdDev.push(transaction.amount);
  }
  var average = totalAmount / transactions.length;
  
  var summedSquares = 0;
  for each(var amount in stdDev) {
    summedSquares += Math.pow((amount - average),2);
  }
  var standardDeviation = Math.sqrt(summedSquares / transactions.length - 1);
  
  payeeRow.push(totalAmount);
  payeeRow.push(transactions.length);
  payeeRow.push(average);
  payeeRow.push(standardDeviation);
  
  return payeeRow;
}

function getCategoryRow(category) {
  var categoryRow = new Array();
  var totalAmount = 0;
  var transactions = fetch("/users/"+userID+"/transactions?per_page="+per_page+"&search="+category);
  var stdDev = new Array();
  
  // Calculate total amount, # of transactions, average, and standard deviation
  for each(var transaction in transactions) {
    totalAmount += transaction.amount;
    stdDev.push(transaction.amount);
  }
  var average = totalAmount / transactions.length;
  
  var summedSquares = 0;
  for each(var amount in stdDev) {
    summedSquares += Math.pow((amount - average),2);
  }
  var standardDeviation = Math.sqrt(summedSquares / transactions.length - 1);
  
  //payeeRow.push(totalAmount);
  categoryRow.push(transactions.length);
  categoryRow.push(average);
  categoryRow.push(standardDeviation);
  categoryRow.push(totalAmount);
  
  return categoryRow;
}

/*
//
These functions essentially work as REST GET actions
//
*/

function fetch(path) {
  var options = {
    method : 'get',
    contentType: "application/json",
    headers: {
      Authorization: 'Key ' + apiKey
    }
  };
  
  var response = JSON.parse(UrlFetchApp.fetch(url + path, options));
  return response; 
}

function getAccountAmount(accountName) {
  for each(var account in accounts) {
    if( account.title == accountName ) {
      return account.current_balance;
    }
  }
} 
