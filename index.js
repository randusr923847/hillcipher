var plain = document.getElementById("plaintext");
var cipher = document.getElementById("ciphertext");
var keytxt = document.getElementById("key").value;
var charset = document.getElementById("character-set").value;
let msg = document.getElementById("message");
let encbtn = document.getElementById("encrypt");
let decbtn = document.getElementById("decrypt");
var modulo = charset.length;
let width = 2;

Number.prototype.mod = function(n)
{
   return ((this % n) + n) % n;
}; //because js built in mod is broken for negative nums :(

function matmul(a, b)
{
   let prod = [];
   let trans = transpose(b);

   for (let r = 0; r < a.length; r++)
   {
      let row = [];
      for (let c = 0; c < trans.length; c++)
      {
         row[c] = dotprod(a[r], trans[c]);
      }
      prod[r] = row;
   }

   return prod;
}

function dotprod(a, b)
{
   let sum = 0;
   for (let i = 0; i < a.length; i++)
   {
      sum += a[i] * b[i];
   }
   return sum;
}

function transpose(arr)
{
   return arr[0].map((_, col) => arr.map(row => row[col]));
}

function applymod(arr, m)
{
   return arr.map((r) => r.map((x) => x.mod(m)));
}

function normalize2DArray(arr)
{
   return arr.map(row => row.map(value => value === -0 ? 0 : value));
}

function str2arr(str, w)
{
   for (let i = 0; i < str.length; i++)
   {
      if (charset.indexOf(str[i]) < 0)
      {
         notify("Invalid input: string must be in character set.", 1);
         throw new Error("Invalid input: string must be in character set.");
      }
   }

   let numbers = str.split("").map(char => charset.indexOf(char));

   let rows = Math.ceil(numbers.length / w);
   let arr = new Array(rows).fill(null).map(() => new Array(w).fill(null));

   let rowIndex = 0;
   let colIndex = 0;
   for (let num of numbers)
   {
      arr[rowIndex][colIndex] = num;
      rowIndex++;
      if (rowIndex === rows)
      {
         rowIndex = 0;
         colIndex++;
      }
   }

   return arr;
}

function arr2str(arr)
{
   if (!Array.isArray(arr) || !arr.every(row => Array.isArray(row)))
   {
      notify("Invalid input: not a 2D matrix.", 1);
      throw new Error("Invalid input: not a 2D matrix.");
   }

   let rows = arr.length;
   let width = arr[0].length;

   if (!arr.every(row => row.every(num => num >= 0 && num <= charset.length - 1)))
   {
      notify("Invalid input: not in character set.", 1);
      throw new Error("Invalid input: not in character set.");
   }

   let str = "";

   for (let colIndex = 0; colIndex < width; colIndex++)
   {
      for (let rowIndex = 0; rowIndex < rows; rowIndex++)
      {
         str += charset.charAt(arr[rowIndex][colIndex]);
      }
   }

   return str;
}

function gcd(x, y)
{
   if (y === 0)
   {
      return x;
   }
   return gcd(y, x.mod(y));
}

function modInverse(a, m, x)
{
   if (gcd(a, m) !== 1)
   {
      notify("No mod inverse: gcd(determinant, m) must be 1.", 1);
      throw new Error("No mod inverse: gcd(determinant, m) must be 1.");
   }

   if ((a * x).mod(m) == 1)
   {
      return x;
   }
   else if (x < 200)
   {
      return modInverse(a, m, x + 1);
   }

   notify("Mod inverse not found: stopped at 200.", 1);
   throw new Error("Mod inverse not found: stopped at 200.");
}

function modInverse2x2(arr, m)
{
   if (!Array.isArray(arr) || arr.length !== 2 || !arr.every(row => row.length === 2))
   {
      notify("Invalid input: key must be a 4 characters long.", 1);
      throw new Error("Invalid input: key must be a 4 characters long.");
   }

   let a = arr[0][0];
   let b = arr[0][1];
   let c = arr[1][0];
   let d = arr[1][1];

   let det = (a * d - b * c);

   let detInverse = modInverse(det, m, 1);
   let inverted = [[d, -b], [-c, a]];

   return normalize2DArray(inverted.map((r) => r.map((x) => (x * detInverse).mod(m))));
}

function notify(m, type)
{
   msg.innerHTML = m;

   if (type == 1)
   {
      msg.classList.add("error");
      msg.classList.remove("success");
   }
   else
   {
      msg.classList.add("success");
      msg.classList.remove("error");
   }
}

function encrypt(plaintext, key)
{
   let keyarr = str2arr(key, width);
   console.log("Key Matrix:");
   console.log(keyarr);

   let plainarr = str2arr(plaintext, width);
   console.log("Plaintext Matrix:");
   console.log(plainarr);

   modInverse2x2(keyarr, modulo); //to check if key has inverse

   let mult = matmul(plainarr, keyarr);
   console.log("Matrix Multiplication:");
   console.log(mult);

   let cipharr = applymod(mult, modulo);
   console.log("Ciphertext Matrix:");
   console.log(cipharr);

   return arr2str(cipharr);
}

function decrypt(ciphertext, key)
{
   let keyarr = str2arr(key, width);
   console.log("Key Matrix:");
   console.log(keyarr);

   keyarr = modInverse2x2(keyarr, modulo);
   console.log("Key Inverse Matrix:");
   console.log(keyarr);

   let cipharr = str2arr(ciphertext, width);
   console.log("Ciphertext Matrix:");
   console.log(cipharr);

   let mult = matmul(cipharr, keyarr);
   console.log("Matrix Multiplication:");
   console.log(mult);

   let plainarr = applymod(mult, modulo);
   console.log("Plaintext Matrix:");
   console.log(plainarr);

   return arr2str(plainarr);
}

encbtn.onclick = function()
{
   plain = document.getElementById("plaintext");
   keytxt = document.getElementById("key").value;
   charset = document.getElementById("character-set").value;
   modulo = charset.length;

   if (plain.value.length == 0)
   {
      notify("Enter plaintext!", 1);
   }
   else if (keytxt.length == 0)
   {
      notify("Enter key!", 1);
   }
   else
   {
      let ciph = encrypt(plain.value, keytxt);
      cipher.value = ciph;
      notify("Encrypted!", 0);
   }
}

decbtn.onclick = function()
{
   cipher = document.getElementById("ciphertext");
   keytxt = document.getElementById("key").value;
   charset = document.getElementById("character-set").value;
   modulo = charset.length;

   if (cipher.value.length == 0)
   {
      notify("Enter ciphertext!", 1);
   }
   else if (keytxt.length == 0)
   {
      notify("Enter key!", 1);
   }
   else
   {
      let pln = decrypt(cipher.value, keytxt);
      plain.value = pln;
      notify("Decrypted!", 0);
   }
}
