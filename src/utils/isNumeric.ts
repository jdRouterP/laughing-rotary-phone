/**
 * Returns true if the string value is number
 * @param inputNumber
 */
 export default function isNumeric(inputNumber: any) {
    return !isNaN(parseFloat(inputNumber)) && isFinite(inputNumber);
  }