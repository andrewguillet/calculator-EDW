const calculatorData = {
  calculation: "",
  result: "",
  displayedResults: false,
};

const buttons = [...document.querySelectorAll("[data-action]")];
const digitsBtns = buttons.filter(
  (button) => /[0-9]/.test(button.getAttribute("data-action"))
  // On retourne un tableau avec filtre  de tt les elements qui ont pour attribut la regex [0-9]
);

// On va pvr chaque btn digit faire un evenement au click pour afficher dans le display
digitsBtns.forEach((btn) => btn.addEventListener("click", handleDigits));

const calculationDisplay = document.querySelector(".calculation");
const resultDisplay = document.querySelector(".result");

function handleDigits(e) {
  const buttonValue = e.target.getAttribute("data-action");

  if (calculatorData.displayedResults) {
    calculationDisplay.textContent = "";
    calculatorData.calculation = "";
    calculatorData.displayedResults = false;
  } else if (calculatorData.calculation === "0")
    calculatorData.calculation = "";
  // On veut savoir la valeur de sur quoi on click

  calculatorData.calculation += buttonValue; // On rajoute a objet calculatorData la valeur du buttonValue
  resultDisplay.textContent = calculatorData.calculation; // On affiche resultat ds la calculette
}

const operatorsBtns = buttons.filter(
  (button) => /[\/+*-]/.test(button.getAttribute("data-action"))
  // On retourne un tableau avec filtre  de tt les elements qui ont pour attribut la regex
);

// On va pvr chaque btn operator faire un evenement au click pour afficher dans le display
operatorsBtns.forEach((btn) => btn.addEventListener("click", handleOperators));

function handleOperators(e) {
  const buttonValue = e.target.getAttribute("data-action");

  if (calculatorData.displayedResults) {
    calculationDisplay.textContent = "";
    calculatorData.calculation = calculatorData.result += buttonValue;
    resultDisplay.textContent = calculatorData.calculation;
    calculatorData.displayedResults = false;
    return;

    // FAIRE LE MOINS AU DEBUT
    // Si calculatorData.calculation est vide et valeur click est -
  } else if (!calculatorData.calculation && buttonValue === "-") {
    calculatorData.calculation += buttonValue;
    resultDisplay.textContent = calculatorData.calculation;
    return;
  } else if (
    !calculatorData.calculation ||
    calculatorData.calculation.slice(-1) === "."
  )
    return;
  // Changer operator + - * au lieu qu'ils s'ajoutent
  else if (
    calculatorData.calculation.slice(-1).match(/[\/+*-]/) &&
    calculatorData.calculation.length !== 1
  ) {
    calculatorData.calculation =
      calculatorData.calculation.slice(0, -1) + buttonValue;
    // slice -1 prends le derniere caractère
    resultDisplay.textContent = calculatorData.calculation;
    // Si calculation est vide, on fait rien (sauf - traité plus haut)
  } else if (calculatorData.calculation.length !== 1) {
    calculatorData.calculation += buttonValue;
    resultDisplay.textContent = calculatorData.calculation;
  }
}

const decimalButton = document.querySelector("[data-action='.']");

decimalButton.addEventListener("click", handleDecimal);

function handleDecimal() {
  if (!calculatorData.calculation) return;

  let lastSetOfNumbers = "";

  for (let i = calculatorData.calculation.length - 1; i >= 0; i--) {
    if (/[\/+*-]/.test(calculatorData.calculation[i])) {
      break;
    } else {
      lastSetOfNumbers += calculatorData.calculation[i];
    }
  }

  if (!lastSetOfNumbers.includes(".")) {
    calculatorData.calculation += ".";
    resultDisplay.textContent = calculatorData.calculation;
  }
}

const equalBtn = document.querySelector("[data-action='=']");

equalBtn.addEventListener("click", handleEqualBtn);

function handleEqualBtn() {
  // Si on termine calcule par un opérator et non un chiffre
  if (/[\/+*-.]/.test(calculatorData.calculation.slice(-1))) {
    calculationDisplay.textContent = "Terminez le calcul par un chiffre.";
    setTimeout(() => {
      calculationDisplay.textContent = "";
    }, 2500);
    return;
  } else if (!calculatorData.displayedResults) {
    calculatorData.result = customEval(calculatorData.calculation);
    resultDisplay.textContent = calculatorData.result;
    calculationDisplay.textContent = calculatorData.calculation;
    calculatorData.displayedResults = true;
  }
}

// fct qui va faire le calcul
function customEval(calculation) {
  if (!/[\/+*-]/.test(calculation.slice(1))) return calculation;
  // slice 1 découpe chaine de cara a partir du 1er (on prends pas 0 car on peut avoir un - au début)

  let operator;
  let operatorIndex;

  // On veut savoir quel type opérator (* /) et son index
  if (/[\/*]/.test(calculation.slice(1))) {
    for (let i = 1; i < calculation.length; i++) {
      if (/[\/*]/.test(calculation[i])) {
        operator = calculation[i];
        operatorIndex = i;
        break;
      }
    }
    //  On veut savoir quel type opérator (+ -) et son index
  } else {
    for (let i = 1; i < calculation.length; i++) {
      if (/[+-]/.test(calculation[i])) {
        operator = calculation[i];
        operatorIndex = i;
        break;
      }
    }
  }

  const operandsInfo = getIndexes(operatorIndex, calculation);
  console.log(operandsInfo);

  let currentCalculationResult;
  switch (operator) {
    case "+":
      currentCalculationResult =
        Number(operandsInfo.leftOperand) + Number(operandsInfo.rightOperand);
      break;
    case "-":
      currentCalculationResult =
        Number(operandsInfo.leftOperand) - Number(operandsInfo.rightOperand);
      break;
    case "*":
      currentCalculationResult =
        Number(operandsInfo.leftOperand) * Number(operandsInfo.rightOperand);
      break;
    case "/":
      currentCalculationResult =
        Number(operandsInfo.leftOperand) / Number(operandsInfo.rightOperand);
      break;
  }

  // On va remplacer nos calculs par le resultat
  // ex calculation = 5000+10*500
  // On va updatecalculation = 5000+5000(il a calculé le 10*500 et la remplacé par resultat)
  // La methode slice. Le 1er index (startinterval) est inclus, alors que le 2nd (endinterval) est exclus
  let updatedCalculation = calculation.replace(
    calculation.slice(
      operandsInfo.startIntervalIndex,
      operandsInfo.lastRightOperandCharacter
    ),
    currentCalculationResult.toString()
  );
  // On recommence pour finir les calcules (5000+5000, du coup 10000) tant qu'il y aura des operators
  if (/[\/+*-]/.test(updatedCalculation.slice(1))) {
    customEval(updatedCalculation);
  }

  console.log(updatedCalculation.split("."));
  // Retourner les chiffres après la virgules
  if (updatedCalculation.includes(".")) {
    if (updatedCalculation.split(".")[1].length === 1) {
      return Number(updatedCalculation).toString();
      // on split en tableau le resultat, et si l'element [1] a 1 chiffre, on retourne
    } else if (updatedCalculation.split(".")[1].length > 1) {
      return Number(updatedCalculation).toFixed(2).toString();
      // Par contre si element [1] a + de 1 chiffre, on stop a 2
    }
  } else {
    return updatedCalculation;
  }
}

// 5500+5065465564+600
function getIndexes(operatorIndex, calculation) {
  let rightOperand = "";
  let lastRightOperandCharacter;

  // Par exemple calcul 50+30/34
  // On boucle, on stop si calculation[i] est un operateur. On définit son index pour connaitre la valeur du début et de la fin de l'operand de droite.
  for (let i = operatorIndex + 1; i <= calculation.length; i++) {
    if (i === calculation.length) {
      lastRightOperandCharacter = calculation.length;
      break;
    }
    // Si on tombe sur un operateur, on break c'est la fin
    else if (/[\/+*-]/.test(calculation[i])) {
      lastRightOperandCharacter = i;
      break;
    } // On rempli jusqu'a la fin le rightoperand
    else {
      rightOperand += calculation[i];
    }
  }

  let leftOperand = "";
  let startIntervalIndex;

  for (let i = operatorIndex - 1; i >= 0; i--) {
    // Si a gauche, le 1er eleme est un - on l'ajoute a operand
    if (i === 0 && /[-]/.test(calculation[i])) {
      startIntervalIndex = 0;
      leftOperand += "-";
      break;
    }
    // Si c'est un 0 on recommence
    else if (i === 0) {
      startIntervalIndex = 0;
      leftOperand += calculation[i];
      break;
    }
    // si on rencontre un autre operator : on stop
    else if (/[\/+*-]/.test(calculation[i])) {
      startIntervalIndex = i + 1;
      break;
      // sinon on rempli juste le leftoperand
    } else {
      leftOperand += calculation[i];
    }
  }

  // Commen on a décrementer avec le -1 dans la boucle, on veut le remettre à l'endroit
  // Je le transforme en tableau split / je le reverse / et je join tout le resultat

  leftOperand = leftOperand.split("").reverse().join("");

  return {
    leftOperand,
    rightOperand,
    startIntervalIndex,
    lastRightOperandCharacter,
  };
}

const resetButton = document.querySelector("[data-action='c']");

resetButton.addEventListener("click", reset);

function reset() {
  calculatorData.calculation = "";
  calculatorData.displayedResults = false;
  calculatorData.result = "";
  resultDisplay.textContent = "0";
  calculationDisplay.textContent = "";
}

const clearEntryButton = document.querySelector("[data-action='ce']");

clearEntryButton.addEventListener("click", clearEntry);

function clearEntry() {
  if (!calculatorData.displayedResults) {
    if (resultDisplay.textContent[0] === "0") return;
    else if (resultDisplay.textContent.length === 1) {
      calculatorData.calculation = "0";
    } else {
      calculatorData.calculation = calculatorData.calculation.slice(0, -1);
    }
    resultDisplay.textContent = calculatorData.calculation;
  }
}
