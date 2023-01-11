class AgriImpexModal {
  currentSeason;
  constructor() {
    let currentYear = new Date().getFullYear();
    let prevYear = new Date().getFullYear() - 1;
    this.currentSeason = prevYear + " - " + currentYear;
  }
}
module.exports = { AgriImpexModal };
