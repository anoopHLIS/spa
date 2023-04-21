var tickets = new Map();
var ticketLimit = 60;
var barcodes = [];
var ticketCurrentCount = 0;

/**
 * Function to load initials on refresh page
 */
function loadInitial() {
  if (!localStorage.getItem("tickets")) {
    localStorage.setItem("tickets", JSON.stringify(tickets));
  } else {
    tickets = JSON.parse(localStorage.getItem("tickets"));
  }

  if (!localStorage.getItem("barcodes")) {
    localStorage.setItem("bardodes", barcodes);
  } else {
    barcodes = localStorage.getItem("barcodes");
  }

  if (!localStorage.getItem("ticketLimit")) {
    localStorage.setItem("ticketLimit", ticketLimit);
  } else {
    ticketLimit = localStorage.getItem("ticketLimit");
  }

  if (!localStorage.getItem("ticketCurrentCount")) {
    localStorage.setItem("ticketCurrentCount", ticketCurrentCount);
  } else {
    ticketCurrentCount = localStorage.getItem("ticketCurrentCount");
  }
}

/**
 *
 * @returns new ticket
 */
function getTicket() {
  if (ticketCurrentCount == ticketLimit) {
    alert("No space available for new consumer");
    return false;
  }
  var barcodeForTicket = generateTicketBarcode(16);
  tickets[barcodeForTicket] = JSON.stringify({
    id: ticketCurrentCount,
    barcode: barcodeForTicket,
    date: new Date(),
  });
  barcodes[ticketCurrentCount] = barcodeForTicket;
  ticketCurrentCount++;
  localStorage.setItem("tickets", JSON.stringify(tickets));
  localStorage.setItem("ticketCurrentCount", ticketCurrentCount);
  localStorage.setItem("barcodes", barcodes);
}

/**
 * Function to get ticket data by barcode
 * @param {*} barcode
 * @returns
 */
function getTicketByBarcode(barcode) {
  return tickets[barcode];
}

/**
 *  Function to generate new barcode
 * @param {length} length
 * @returns
 */
function generateTicketBarcode(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}