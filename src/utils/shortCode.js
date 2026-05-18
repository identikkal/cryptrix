const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const CODE_LENGTH = 6;

function generateShortCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return code;
}

function isValidShortCode(code) {
  const regex = new RegExp(`^[A-Za-z0-9]{${CODE_LENGTH}}$`);
  return regex.test(code);
}

module.exports = {
  generateShortCode,
  isValidShortCode,
};
