let CURRENT_DATE = new Intl.DateTimeFormat(navigator.language || "en", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());
let now = new Date();

function minDate() {
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();

  return `${year}-${month + 1}-${day}`;
}

export { CURRENT_DATE, minDate, now };
