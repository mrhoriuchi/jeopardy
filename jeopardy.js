const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
  let res = await axios.get("https://jservice.io/api/categories?count=100");
  const catIds = res.data.map((result) => result.id);
  // .filter((value) => {
  //   value.clues.length >= 5;
  // });
  // Makes an array of 6 of the 100 catergories.
  console.log(catIds);
  return _.sampleSize(catIds, NUM_CATEGORIES);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {
  const res = await axios.get(`https://jservice.io/api/category?id=${catId}`);
  const arr = res.data.clues
    .map((result) => {
      return {
        question: result.question,
        answer: result.answer,
        showing: null,
      };
    })
    .filter((value) => {
      return value.question !== "=";
    });
  const clueArr = _.sampleSize(arr, NUM_QUESTIONS_PER_CAT);
  return { title: res.data.title, clues: clueArr };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
async function fillTable() {
  $("#jeopardy thead").empty();
  const $tr = $("<tr>");
  for (let i = 0; i < NUM_CATEGORIES; i++) {
    // This will create the header part with categories
    $tr.append($("<th>").text(categories[i].title));
  }
  $("#jeopardy thead").append($tr);

  $("#jeopardy tbody").empty();
  for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
    // This will create the questions/answers with a nested forloop
    const body$tr = $("<tr>");
    for (let j = 0; j < NUM_CATEGORIES; j++) {
      body$tr.append($("<td>").attr("id", `${j}-${i}`).text("?"));
    }
    $("#jeopardy tbody").append(body$tr);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
function handleClick(evt) {
  let id = evt.target.id;
  let [catId, clueId] = id.split("-");
  let clue = categories[catId].clues[clueId];
  if (!clue) {
    alert("Sorry, there's a missing question");
  }
  if (!clue.showing) {
    clue.showing = "question";
    $(`#${id}`).html(clue.question);
  } else if (clue.showing === "question") {
    clue.showing = "answer";
    $(`#${id}`).html(clue.answer);
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
  categories = [];
  const catIds = await getCategoryIds();
  for (let catId of catIds) {
    categories.push(await getCategory(catId));
  }
  fillTable();
}

/** On click of start / restart button, set up game. */
$("#start").on("click", function () {
  setupAndStart();
  $("#spin-container").hide();
  $("#start").text("Restart!");
});

/** On page load, add event handler for clicking clues */
$(async function () {
  $("#jeopardy").on("click", "td", handleClick);
});
// $(async function () {
//   setupAndStart();
//   $("#jeopardy").on("click", "td", handleClick);
// });
