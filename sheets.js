// Global variables
//
// These should be changed!
var apiKey = "";
//
// These are okay
var url = "https://api.pocketsmith.com/v2";
var userID = fetch("/me").id;
var per_page = 100;
//

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
    var payeeRow = payeeAmountGet(payee);
    var column = 2;
    for each(var attribute in payeeRow) {
      sheet.getRange(row,column).setValue(attribute);
      column++;
    }
    row++;
  }
}

function payeeAmountGet(payee) {
  var payeeRow = new Array();
  var totalAmount = 0;
  var transactions = fetch("/users/"+userID+"/transactions?per_page="+per_page+"&search="+payee);
  var stdDev = new Array();
  
  // Calculate total amount, # of transactions, average, and standard deviation
  for(var transactionIndex in transactions) {
    var transaction = transactions[transactionIndex];
    totalAmount += transaction.amount;
    stdDev[transactionIndex] = transaction.amount;
  }
  var average = totalAmount / transactions.length;
  var summedSquares = 0;
  for(var index in stdDev) {
    summedSquares += Math.pow((stdDev[index] - average),2);
  }
  var standardDeviation = Math.sqrt(summedSquares / stdDev.length - 1);
  
  payeeRow.push(totalAmount);
  payeeRow.push(transactions.length);
  payeeRow.push(average);
  payeeRow.push(standardDeviation);
  
  return payeeRow;
}

/*
// Needs tweaking
//
function AccountReport()
{
  // Sheet details
  var sheetName = "Account Report";
  var cells = "A2:H35";
  
  // Clear the existing content
  var range = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getRange(cells).clearContent();
  
  // Display accounts
  var row = 0;
  var range = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getRange(cells);
  var values = range.getValues();
  
  var assets = ["bank","other_assets"];
  var liabilities = ["credits","loans","other_liability"];
  var type_row = [0][0][0];
  
  var accounts = fetch("/users/85943/accounts");
  
  for(var accountIndex in accounts) {
    var account = accounts[accountIndex];
    
    // Sort and display accounts
    if(assets.indexOf(account.type) != -1) {
      values[row][0] = account.title;
      values[row][1] = account.current_balance;
    }
    else if(liabilities.indexOf(account.type) != -1) {
      values[row][0+3] = account.title;
      values[row][0+4] = account.current_balance;
    }
    else
    {
      values[row][0+6] = account.title;
      values[row][0+7] = account.current_balance;
    }
    
    row++;
  }
  
  range.setValues(values);
}*/


/*
//
These functions essentially work as REST actions
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

function accountAmountGet(accountName) {
  var path = "/users/"+userID+"/accounts";
  var accounts = fetch(path);
  
  for(var accountIndex in accounts) {
    var account = accounts[accountIndex];
    if( account.title == accountName ) {
      return account.current_balance;
    }
  }  
}

