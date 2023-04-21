var tickets = new Map();
var ticketLimit = 60;
var barcodes = [];
var ticketCurrentCount = 0;
var isGenerated = false;
var timePerHr = 30;
var extendTimePerHr = 3;
var minimumTime = 3;

var paymentMethod = ["Credit Card", "Debit Card", "Cash"];
var paidTickets = new Map();

/**
 * Function to load initials on refresh page
 */
function loadInitial() {
    if (!localStorage.getItem("tickets")) {
        localStorage.setItem("tickets", JSON.stringify(tickets));
    } else {
        tickets = JSON.parse(localStorage.getItem("tickets"));
    }

    if (!localStorage.getItem("paidTickets")) {
        localStorage.setItem("paidTickets", JSON.stringify(paidTickets));
    } else {
        paidTickets = JSON.parse(localStorage.getItem("paidTickets"));
    }

    if (!localStorage.getItem("barcodes")) {
        localStorage.setItem("barcodes", JSON.stringify(barcodes));
    } else {
        barcodes = JSON.parse(localStorage.getItem("barcodes"));
        document.getElementById("tickets").innerHTML = barcodes;
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
        document.getElementById("ticketCount").innerHTML = ticketCurrentCount;
    }
}

/**
 * Task 1
 * Function that
 calculates and returns a new barcode (16 digits).
 Save the ticket and time when the ticket is given out for later reference.
 * @returns new ticket
 */
function getTicket() {
    if (ticketCurrentCount === ticketLimit) {
        alert("No space available for new people");
        return false;
    }
    var barcodeForTicket = generateTicketBarcode(16);
    tickets[barcodeForTicket] = JSON.stringify({
        id: ticketCurrentCount,
        barcode: barcodeForTicket,
        date: new Date(),
    });
    barcodes.push(barcodeForTicket);
    ticketCurrentCount++;
    localStorage.setItem("tickets", JSON.stringify(tickets));
    localStorage.setItem("ticketCurrentCount", ticketCurrentCount);
    localStorage.setItem("barcodes", JSON.stringify(barcodes));
    document.getElementById("tickets").innerHTML = barcodes;
    document.getElementById("ticketCount").innerHTML = ticketCurrentCount;
    // document.getElementById("generateTicketBtn").style.display = 'none';
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

/**
 * Task 2
 * Function to calculate price of barcode
 * @param barcode
 */
function calculatePrice(barcode) {
    if(barcode.length === 16){
    var paidTicket = paidTickets[barcode];

    if (paidTicket) {
        var paidTicketJson = JSON.parse(paidTicket);

        var currentTime = new Date().getTime();
        var paidTime = new Date(paidTicketJson.paidAt).getTime();

        var diffInMinutes = (currentTime - paidTime) / 6e4;

        // if took more than 15 mins before exit, then need to make another payment
        if (diffInMinutes > 15) {
            var diffInHr = Math.floor(diffInMinutes / 60);
            var extraPrice;
            if (diffInHr === 0) {
                extraPrice = extendTimePerHr;
            } else {
                extraPrice = extendTimePerHr * diffInHr;
            }
            document.getElementById("calculatePriceResult").innerHTML = extraPrice;
            return {price:extraPrice};
        }

        document.getElementById("calculatePriceResult").innerHTML = 0;
        return {...paidTicketJson,price:0};
    }
    var ticket = tickets[barcode];
    var current = new Date();
    var ticketTime = new Date(JSON.parse(ticket).date);
    var timeDifferenceInHrs =
        Math.abs(current.getTime() - ticketTime.getTime()) / 36e5;

    if (timeDifferenceInHrs < minimumTime || timeDifferenceInHrs === minimumTime) {
        document.getElementById("calculatePriceResult").innerHTML = timePerHr;
        return {price:timePerHr};
    } else {
        var timeDiff = timeDifferenceInHrs;
        // setting timePerHr
        var price = timePerHr;
        // deducting minimum 3 hrs
        timeDiff = timeDiff - minimumTime;

        // calculating price based on remaining hrs * minimumTime
        price = price + Math.floor(timeDiff) * extendTimePerHr;
        document.getElementById("calculatePriceResult").innerHTML = price;
        return {price: price};
    }
}else{
    document.getElementById("calculatePriceResult").innerHTML = 'N/A';
    return {price: 0};
}
}

/**
 * Task 3
 * Function that marks the ticket as paid and saves the time and
 payment option used.
 * @param barcode
 * @param paymentMethodCode
 * @returns {any}
 */
function payTicket(barcode, paymentMethodCode) {
    // check if already paid or not
    var paidTicket = paidTickets[barcode];

    if (paidTicket) {
        var paidTicketJson = JSON.parse(paidTicket);

        var currentTime = new Date().getTime();
        var paidTime = new Date(paidTicketJson.paidAt).getTime();

        var diffInMinutes = (currentTime - paidTime) / 6e4;

        // if took more than 15 mins before exit, then need to make another payment
        if (diffInMinutes > 15) {
            var diffInHr = Math.floor(diffInMinutes / 60);
            var extraPrice;
            if (diffInHr === 0) {
                extraPrice = extendTimePerHr;
            } else {
                extraPrice = extendTimePerHr * diffInHr;
            }
            paidTickets[barcode] = JSON.stringify({
                amount: paidTicketJson.amount,
                paymentMethod: paymentMethodCode,
                paidAt: new Date(),
                extraAmount: extraPrice,
                ticketPaidAt: new Date(paidTicketJson.paidAt)
            });
            localStorage.setItem("paidTickets", JSON.stringify(paidTickets));
        } else {

            // if already paid and ready for exit
            return {...paidTicketJson, status: 'already paid'};
        }
    } else {
        paidTickets[barcode] = JSON.stringify({
            amount: calculatePrice(barcode),
            paymentMethod: paymentMethodCode,
            paidAt: new Date(),
        });
        // ticketCurrentCount--; // to be uncomment when need to exit
        // localStorage.setItem('ticketCurrentCount', ticketCurrentCount);
        localStorage.setItem("paidTickets", JSON.stringify(paidTickets));
    }
}

/**
 * Task 4
 *  Function that returns the state (paid or unpaid) of the ticket.
 * @param barcode
 * @returns {string}
 */
function getTicketState(barcode) {
    var paidTicket = paidTickets[barcode];
    if (paidTicket) {
        var paidTicketJson = JSON.parse(paidTicket);

        var currentTime = new Date().getTime();
        var paidTime = new Date(paidTicketJson.paidAt).getTime();

        var diffInMinutes = (currentTime - paidTime) / 6e4;

        if (diffInMinutes > 15)
            return "unpaid";
        return "paid";


    }
    return "unpaid";
}

/**
 * Task 5
 * Function that calculates the currently available spaces. Make
 sure that there can't be more people in the Spa than available spaces.
 */
function getFreeSpaces() {
    document.getElementById("freeSpaceCount").innerHTML = (ticketLimit - ticketCurrentCount);
    return ticketLimit - ticketCurrentCount;

}