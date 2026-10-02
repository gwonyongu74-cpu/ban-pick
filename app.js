```javascript
/* =========================================================
   LoL DRAFT SIMULATOR
   GitHub Pages compatible
========================================================= */


/* =========================================================
   DOM
========================================================= */

const $ = id => document.getElementById(id);


/* SETUP */

const setupScreen = $("setupScreen");
const draftScreen = $("draftScreen");
const finalScreen = $("finalScreen");

const blueTeamNameInput = $("blueTeamName");
const redTeamNameInput = $("redTeamName");

const blueLogoInput = $("blueLogo");
const redLogoInput = $("redLogo");

const blueLogoPreview = $("blueLogoPreview");
const redLogoPreview = $("redLogoPreview");

const startDraftButton = $("startDraft");


/* DRAFT */

const phaseLabel = $("phaseLabel");
const timerElement = $("timer");

const turnSide = $("turnSide");
const turnAction = $("turnAction");

const seriesLabel = $("seriesLabel");

const championSearch = $("championSearch");
const roleFilter = $("roleFilter");
const championGrid = $("championGrid");

const lockPreview = $("lockPreview");
const previewImage = $("previewImage");
const previewName = $("previewName");
const previewRole = $("previewRole");

const lockButton = $("lockButton");
const cancelButton = $("cancelButton");

const blueBans = $("blueBans");
const redBans = $("redBans");

const bluePicks = $("bluePicks");
const redPicks = $("redPicks");

const blueFearlessBans =
    $("blueFearlessBans");

const redFearlessBans =
    $("redFearlessBans");

const blueFearlessSlots =
    $("blueFearlessSlots");

const redFearlessSlots =
    $("redFearlessSlots");

const fearlessWarning =
    $("fearlessWarning");

const fearlessCount =
    $("fearlessCount");

const blueAction = $("blueAction");
const redAction = $("redAction");

const draftMessage = $("draftMessage");

const undoButton = $("undoButton");
const resetButton = $("resetButton");


/* HEADER */

const blueHeaderName =
    $("blueHeaderName");

const redHeaderName =
    $("redHeaderName");

const bluePanelName =
    $("bluePanelName");

const redPanelName =
    $("redPanelName");

const blueHeaderLogo =
    $("blueHeaderLogo");

const redHeaderLogo =
    $("redHeaderLogo");


/* FINAL */

const finalGameTitle =
    $("finalGameTitle");

const finalBlueName =
    $("finalBlueName");

const finalRedName =
    $("finalRedName");

const finalBlueLogo =
    $("finalBlueLogo");

const finalRedLogo =
    $("finalRedLogo");

const finalBluePicks =
    $("finalBluePicks");

const finalRedPicks =
    $("finalRedPicks");

const nextGameArea =
    $("nextGameArea");

const nextGameButton =
    $("nextGameButton");


/* =========================================================
   DATA
========================================================= */

let champions = [];

let latestVersion = "";

let selectedChampion = null;


/* =========================================================
   SETUP STATE
========================================================= */

let selectedSeries = 1;

let fearlessEnabled = false;

let blueLogoData = null;
let redLogoData = null;


/* =========================================================
   SERIES STATE
========================================================= */

let seriesState = {

    blueTeam: "BLUE TEAM",

    redTeam: "RED TEAM",

    bestOf: 1,

    fearless: false,

    currentGame: 1,

    games: [],

    previousPickedIds: new Set()
};


/* =========================================================
   GAME STATE
========================================================= */

let gameState = null;

let history = [];

let timerInterval = null;

let timer = 30;


/* =========================================================
   DRAFT ORDER
========================================================= */

/*

    Standard competitive Draft:

    BAN PHASE 1
    B R B R B R

    PICK PHASE 1
    B R R B B R

    BAN PHASE 2
    R B R B

    PICK PHASE 2
    R B B R

    Total:
    10 BANS
    10 PICKS

*/

const DRAFT_ORDER = [

    /* BAN 1 */

    { type: "ban", team: "blue" },
    { type: "ban", team: "red" },
    { type: "ban", team: "blue" },
    { type: "ban", team: "red" },
    { type: "ban", team: "blue" },
    { type: "ban", team: "red" },


    /* PICK 1 */

    { type: "pick", team: "blue" },
    { type: "pick", team: "red" },
    { type: "pick", team: "red" },
    { type: "pick", team: "blue" },
    { type: "pick", team: "blue" },
    { type: "pick", team: "red" },


    /* BAN 2 */

    { type: "ban", team: "red" },
    { type: "ban", team: "blue" },
    { type: "ban", team: "red" },
    { type: "ban", team: "blue" },


    /* PICK 2 */

    { type: "pick", team: "red" },
    { type: "pick", team: "blue" },
    { type: "pick", team: "blue" },
    { type: "pick", team: "red" }
];


/* =========================================================
   AUDIO
========================================================= */

let audioContext = null;

function getAudioContext() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
    }

    return audioContext;
}


function playSound(
    frequency = 500,
    duration = 0.08
) {

    try {

        const ctx =
            getAudioContext();

        const oscillator =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        oscillator.frequency.value =
            frequency;

        oscillator.type =
            "sine";

        gain.gain.setValueAtTime(
            0.04,
            ctx.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start();

        oscillator.stop(
            ctx.currentTime + duration
        );

    } catch (error) {
        /* audio is optional */
    }
}


/* =========================================================
   DATA DRAGON
========================================================= */

async function loadChampionData() {

    championGrid.innerHTML = `
        <div style="
            grid-column:1/-1;
            text-align:center;
            padding:50px;
            color:#737d8b;
        ">
            챔피언 데이터를 불러오는 중...
        </div>
    `;

    try {

        const versionResponse =
            await fetch(
                "https://ddragon.leagueoflegends.com/api/versions.json"
            );

        const versions =
            await versionResponse.json();

        latestVersion =
            versions[0];


        const championResponse =
            await fetch(
                `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/ko_KR/champion.json`
            );

        const championData =
            await championResponse.json();


        champions =
            Object.values(
                championData.data
            );


        renderChampions();


    } catch (error) {

        console.error(error);

        championGrid.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:50px;
                color:#d85c64;
            ">
                챔피언 데이터를 불러오지 못했습니다.
                <br>
                인터넷 연결을 확인해주세요.
            </div>
        `;
    }
}


/* =========================================================
   CHAMPION IMAGE
========================================================= */

function getChampionImage(champion) {

    return (
        `https://ddragon.leagueoflegends.com/cdn/` +
        `${latestVersion}/img/champion/` +
        `${champion.image.full}`
    );
}


/* =========================================================
   SETUP BUTTONS
========================================================= */

document
    .querySelectorAll(".series-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".series-button")
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );

                button.classList.add(
                    "active"
                );

                selectedSeries =
                    Number(
                        button.dataset.series
                    );
            }
        );
    });


$("standardMode")
    .addEventListener(
        "click",
        () => {

            fearlessEnabled = false;

            $("standardMode")
                .classList.add("active");

            $("fearlessMode")
                .classList.remove("active");
        }
    );


$("fearlessMode")
    .addEventListener(
        "click",
        () => {

            fearlessEnabled = true;

            $("fearlessMode")
                .classList.add("active");

            $("standardMode")
                .classList.remove("active");
        }
    );


/* =========================================================
   LOGO UPLOAD
========================================================= */

function setupLogoInput(
    input,
    preview,
    textElement,
    side
) {

    input.addEventListener(
        "change",
        () => {

            const file =
                input.files[0];

            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    if (side === "blue") {

                        blueLogoData =
                            event.target.result;

                    } else {

                        redLogoData =
                            event.target.result;
                    }


                    preview.src =
                        event.target.result;

                    preview.hidden =
                        false;

                    textElement.textContent =
                        file.name;
                };


            reader.readAsDataURL(file);
        }
    );
}


setupLogoInput(
    blueLogoInput,
    blueLogoPreview,
    $("blueLogoText"),
    "blue"
);


setupLogoInput(
    redLogoInput,
    redLogoPreview,
    $("redLogoText"),
    "red"
);


/* =========================================================
   START SERIES
========================================================= */

startDraftButton.addEventListener(
    "click",
    () => {

        seriesState = {

            blueTeam:
                blueTeamNameInput.value.trim()
                || "BLUE TEAM",

            redTeam:
                redTeamNameInput.value.trim()
                || "RED TEAM",

            bestOf:
                selectedSeries,

            fearless:
                fearlessEnabled,

            currentGame: 1,

            games: [],

            previousPickedIds:
                new Set()
        };


        updateTeamNames();

        setupScreen.classList.add(
            "hidden"
        );

        finalScreen.classList.add(
            "hidden"
        );

        draftScreen.classList.remove(
            "hidden"
        );


        startGame();
    }
);


/* =========================================================
   TEAM NAMES
========================================================= */

function updateTeamNames() {

    blueHeaderName.textContent =
        seriesState.blueTeam;

    redHeaderName.textContent =
        seriesState.redTeam;

    bluePanelName.textContent =
        seriesState.blueTeam;

    redPanelName.textContent =
        seriesState.redTeam;


    if (blueLogoData) {

        blueHeaderLogo.src =
            blueLogoData;

        blueHeaderLogo.hidden =
            false;
    }


    if (redLogoData) {

        redHeaderLogo.src =
            redLogoData;

        redHeaderLogo.hidden =
            false;
    }
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    gameState = {

        step: 0,

        blueBans: [],
        redBans: [],

        bluePicks: [],
        redPicks: [],

        locked: false
    };


    history = [];

    selectedChampion = null;

    lockPreview.classList.add(
        "hidden"
    );

    championBrowserVisible(true);

    seriesLabel.textContent =
        `GAME ${seriesState.currentGame}`;


    renderAll();

    startTimer();
}


/* =========================================================
   FEARLESS IDS
========================================================= */

function getFearlessIds() {

    if (
        !seriesState.fearless
    ) {
        return new Set();
    }


    return new Set(
        seriesState.previousPickedIds
    );
}


/* =========================================================
   CURRENT STEP
========================================================= */

function currentStep() {

    return DRAFT_ORDER[
        gameState.step
    ];
}


/* =========================================================
   SELECTED IDS
========================================================= */

function getSelectedIds() {

    const ids = new Set();

    gameState.blueBans
        .forEach(c => ids.add(c.id));

    gameState.redBans
        .forEach(c => ids.add(c.id));

    gameState.bluePicks
        .forEach(c => ids.add(c.id));

    gameState.redPicks
        .forEach(c => ids.add(c.id));

    getFearlessIds()
        .forEach(id => ids.add(id));

    return ids;
}


/* =========================================================
   CHAMPION RENDER
========================================================= */

function renderChampions() {

    const keyword =
        championSearch.value
            .trim()
            .toLowerCase();

    const role =
        roleFilter.value;

    const unavailable =
        getSelectedIds();


    championGrid.innerHTML = "";


    const filtered =
        champions.filter(
            champion => {

                const matchesName =
                    champion.name
                        .toLowerCase()
                        .includes(keyword)
                    ||
                    champion.id
                        .toLowerCase()
                        .includes(keyword);


                const matchesRole =
                    role === "all"
                    ||
                    champion.tags.includes(
                        role
                    );


                return (
                    matchesName &&
                    matchesRole
                );
            }
        );


    filtered.forEach(
        champion => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "champion";


            if (
                unavailable.has(
                    champion.id
                )
            ) {

                element.classList.add(
                    "unavailable"
                );

            } else {

                element.addEventListener(
                    "click",
                    () => previewChampion(
                        champion
                    )
                );
            }


            element.innerHTML = `

                <div class="champion-image">

                    <img
                        src="${getChampionImage(champion)}"
                        alt="${champion.name}"
                    >

                </div>

                <div class="champion-name">
                    ${champion.name}
                </div>

            `;


            championGrid.appendChild(
                element
            );
        }
    );


    updateFearlessDisplay();
}


/* =========================================================
   PREVIEW
========================================================= */

function previewChampion(
    champion
) {

    if (
        gameState.locked
    ) {
        return;
    }


    const step =
        currentStep();


    if (!step) {
        return;
    }


    if (
        getSelectedIds().has(
            champion.id
        )
    ) {

        return;
    }


    selectedChampion =
        champion;


    previewImage.src =
        getChampionImage(champion);

    previewName.textContent =
        champion.name;

    previewRole.textContent =
        champion.tags.join(
            " / "
        );


    lockPreview.classList.remove(
        "hidden"
    );


    championBrowserVisible(
        false
    );


    playSound(650, 0.06);
}


/* =========================================================
   CANCEL PREVIEW
========================================================= */

cancelButton.addEventListener(
    "click",
    () => {

        selectedChampion = null;

        lockPreview.classList.add(
            "hidden"
        );

        championBrowserVisible(
            true
        );
    }
);


/* =========================================================
   LOCK IN
========================================================= */

lockButton.addEventListener(
    "click",
    () => {

        if (
            !selectedChampion ||
            gameState.locked
        ) {

            return;
        }


        const step =
            currentStep();


        if (!step) {
            return;
        }


        if (
            getSelectedIds().has(
                selectedChampion.id
            )
        ) {

            return;
        }


        saveHistory();


        if (
            step.type === "ban"
        ) {

            if (
                step.team === "blue"
            ) {

                gameState.blueBans.push(
                    selectedChampion
                );

            } else {

                gameState.redBans.push(
                    selectedChampion
                );
            }


            playSound(320, 0.12);

        } else {

            if (
                step.team === "blue"
            ) {

                gameState.bluePicks.push(
                    selectedChampion
                );

            } else {

                gameState.redPicks.push(
                    selectedChampion
                );
            }


            playSound(760, 0.12);
        }


        selectedChampion = null;

        lockPreview.classList.add(
            "hidden"
        );

        championBrowserVisible(
            true
        );


        gameState.step++;


        if (
            gameState.step >=
            DRAFT_ORDER.length
        ) {

            finishGame();

        } else {

            startTimer();

            renderAll();
        }
    }
);


/* =========================================================
   SAVE HISTORY
========================================================= */

function saveHistory() {

    history.push(
        JSON.parse(
            JSON.stringify(
                gameState
            )
        )
    );
}


/* =========================================================
   UNDO
========================================================= */

undoButton.addEventListener(
    "click",
    () => {

        if (
            history.length === 0
        ) {

            return;
        }


        gameState =
            history.pop();


        selectedChampion = null;


        lockPreview.classList.add(
            "hidden"
        );


        championBrowserVisible(
            true
        );


        startTimer();

        renderAll();

        playSound(420, 0.08);
    }
);


/* =========================================================
   TIMER
========================================================= */

function startTimer() {

    stopTimer();

    timer = 30;

    timerElement.textContent =
        timer;


    timerInterval =
        setInterval(
            () => {

                timer--;

                timerElement.textContent =
                    timer;


                if (
                    timer <= 10
                ) {

                    timerElement.style.color =
                        "#ed4b58";

                } else {

                    timerElement.style.color =
                        "var(--gold)";
                }


                if (
                    timer <= 0
                ) {

                    stopTimer();

                    handleTimeOut();
                }

            },
            1000
        );
}


function stopTimer() {

    if (
        timerInterval
    ) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;
    }
}


/* =========================================================
   TIMEOUT
========================================================= */

function handleTimeOut() {

    /*
        실제 대회 서버의 자동 선택 규칙과는
        별개인 시뮬레이터 기능이다.

        여기서는 랜덤으로 사용 가능한 챔피언을
        자동 선택한다.
    */

    const unavailable =
        getSelectedIds();


    const available =
        champions.filter(
            champion =>
                !unavailable.has(
                    champion.id
                )
        );


    if (
        available.length === 0
    ) {

        return;
    }


    const randomChampion =
        available[
            Math.floor(
                Math.random() *
                available.length
            )
        ];


    previewChampion(
        randomChampion
    );


    setTimeout(
        () => {

            lockButton.click();

        },
        400
    );
}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderBans();

    renderPicks();

    renderChampions();

    renderTurn();

    updateTimerDisplay();
}


/* =========================================================
   BANS
========================================================= */

function renderBans() {

    blueBans.innerHTML = "";
    redBans.innerHTML = "";

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        createBanSlot(
            blueBans,
            gameState.blueBans[i]
        );

        createBanSlot(
            redBans,
            gameState.redBans[i]
        );
    }


    renderFearlessBans();
}


function createBanSlot(
    container,
    champion
) {

    const slot =
        document.createElement(
            "div"
        );

    slot.className =
        "ban-slot";


    if (champion) {

        slot.innerHTML = `
            <img
                src="${getChampionImage(champion)}"
                alt="${champion.name}"
            >
        `;
    }


    container.appendChild(
        slot
    );
}


/* =========================================================
   FEARLESS BANS
========================================================= */

function renderFearlessBans() {

    if (
        !seriesState.fearless
    ) {

        blueFearlessBans.classList.add(
            "hidden"
        );

        redFearlessBans.classList.add(
            "hidden"
        );

        return;
    }


    const fearless =
        champions.filter(
            champion =>
                getFearlessIds().has(
                    champion.id
                )
        );


    if (
        fearless.length === 0
    ) {

        blueFearlessBans.classList.add(
            "hidden"
        );

        redFearlessBans.classList.add(
            "hidden"
        );

        return;
    }


    blueFearlessBans.classList.remove(
        "hidden"
    );

    redFearlessBans.classList.remove(
        "hidden"
    );


    blueFearlessSlots.innerHTML = "";
    redFearlessSlots.innerHTML = "";


    fearless.forEach(
        champion => {

            const blueSlot =
                document.createElement(
                    "div"
                );

            blueSlot.className =
                "ban-slot fearless-slot";

            blueSlot.innerHTML = `
                <img
                    src="${getChampionImage(champion)}"
                    alt="${champion.name}"
                    title="${champion.name}"
                >
            `;


            const redSlot =
                blueSlot.cloneNode(
                    true
                );


            blueFearlessSlots.appendChild(
                blueSlot
            );

            redFearlessSlots.appendChild(
                redSlot
            );
        }
    );
}


/* =========================================================
   PICKS
========================================================= */

function renderPicks() {

    bluePicks.innerHTML = "";
    redPicks.innerHTML = "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        createPickSlot(
            bluePicks,
            gameState.bluePicks[i],
            i + 1
        );

        createPickSlot(
            redPicks,
            gameState.redPicks[i],
            i + 1
        );
    }
}


function createPickSlot(
    container,
    champion,
    number
) {

    const slot =
        document.createElement(
            "div"
        );

    slot.className =
        "pick-slot";


    if (champion) {

        slot.innerHTML = `

            <div class="pick-image">

                <img
                    src="${getChampionImage(champion)}"
                    alt="${champion.name}"
                >

            </div>

            <div class="pick-info">

                <div class="pick-number">
                    PLAYER ${number}
                </div>

                <div class="pick-name">
                    ${champion.name}
                </div>

            </div>

        `;

    } else {

        slot.innerHTML = `

            <div class="pick-image pick-empty">
                ?
            </div>

            <div class="pick-info">

                <div class="pick-number">
                    PLAYER ${number}
                </div>

                <div class="pick-name">
                    NOT SELECTED
                </div>

            </div>

        `;
    }


    container.appendChild(
        slot
    );
}


/* =========================================================
   TURN
========================================================= */

function renderTurn() {

    if (
        gameState.step >=
        DRAFT_ORDER.length
    ) {

        turnSide.textContent =
            "DRAFT";

        turnAction.textContent =
            "COMPLETE";

        return;
    }


    const step =
        currentStep();


    const isBlue =
        step.team === "blue";


    turnSide.textContent =
        isBlue
            ? `${seriesState.blueTeam}`
            : `${seriesState.redTeam}`;


    turnAction.textContent =
        step.type === "ban"
            ? "BAN"
            : "PICK";


    turnSide.style.color =
        isBlue
            ? "var(--blue-light)"
            : "var(--red-light)";


    blueAction.textContent =
        isBlue
            ? step.type.toUpperCase()
            : "";

    redAction.textContent =
        !isBlue
            ? step.type.toUpperCase()
            : "";


    const banCount =
        gameState.blueBans.length +
        gameState.redBans.length;


    if (
        step.type === "ban"
    ) {

        if (
            banCount < 6
        ) {

            phaseLabel.textContent =
                "BAN PHASE 1";

        } else {

            phaseLabel.textContent =
                "BAN PHASE 2";
        }

    } else {

        phaseLabel.textContent =
            "PICK PHASE";
    }


    draftMessage.textContent =
        `${isBlue
            ? seriesState.blueTeam
            : seriesState.redTeam}
        ${step.type.toUpperCase()}`;
}


/* =========================================================
   TIMER
========================================================= */

function updateTimerDisplay() {

    timerElement.textContent =
        timer;

    timerElement.style.color =
        timer <= 10
            ? "var(--red-light)"
            : "var(--gold)";
}


/* =========================================================
   CHAMPION BROWSER
========================================================= */

function championBrowserVisible(
    visible
) {

    const browser =
        $("championBrowser");


    if (visible) {

        browser.classList.remove(
            "hidden"
        );

    } else {

        browser.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   FEARLESS DISPLAY
========================================================= */

function updateFearlessDisplay() {

    if (
        !seriesState.fearless
    ) {

        fearlessWarning.classList.add(
            "hidden"
        );

        return;
    }


    const count =
        getFearlessIds().size;


    fearlessWarning.classList.remove(
        "hidden"
    );


    fearlessCount.textContent =
        `${count} champions unavailable`;
}


/* =========================================================
   SEARCH
========================================================= */

championSearch.addEventListener(
    "input",
    renderChampions
);


roleFilter.addEventListener(
    "change",
    renderChampions
);


/* =========================================================
   RESET GAME
========================================================= */

resetButton.addEventListener(
    "click",
    () => {

        stopTimer();

        startGame();
    }
);


/* =========================================================
   FINISH GAME
========================================================= */

function finishGame() {

    stopTimer();


    gameState.locked = true;


    /*
        이번 게임의 모든 픽을
        Fearless 누적 목록에 추가
    */

    if (
        seriesState.fearless
    ) {

        gameState.bluePicks
            .forEach(
                champion =>
                    seriesState.previousPickedIds
                        .add(
                            champion.id
                        )
            );


        gameState.redPicks
            .forEach(
                champion =>
                    seriesState.previousPickedIds
                        .add(
                            champion.id
                        )
            );
    }


    seriesState.games.push(
        {
            game:
                seriesState.currentGame,

            blueBans:
                [...gameState.blueBans],

            redBans:
                [...gameState.redBans],

            bluePicks:
                [...gameState.bluePicks],

            redPicks:
                [...gameState.redPicks]
        }
    );


    showFinalScreen();


    playSound(900, 0.25);
}


/* =========================================================
   FINAL SCREEN
========================================================= */

function showFinalScreen() {

    draftScreen.classList.add(
        "hidden"
    );

    finalScreen.classList.remove(
        "hidden"
    );


    finalGameTitle.textContent =
        `GAME ${seriesState.currentGame}`;


    finalBlueName.textContent =
        seriesState.blueTeam;

    finalRedName.textContent =
        seriesState.redTeam;


    if (blueLogoData) {

        finalBlueLogo.src =
            blueLogoData;

        finalBlueLogo.hidden =
            false;
    }


    if (redLogoData) {

        finalRedLogo.src =
            redLogoData;

        finalRedLogo.hidden =
            false;
    }


    renderFinalPicks(
        finalBluePicks,
        gameState.bluePicks
    );

    renderFinalPicks(
        finalRedPicks,
        gameState.redPicks
    );


    if (
        seriesState.currentGame <
        seriesState.bestOf
    ) {

        nextGameArea.classList.remove(
            "hidden"
        );

        nextGameButton.textContent =
            `GAME ${seriesState.currentGame + 1}`;
    } else {

        nextGameArea.classList.remove(
            "hidden"
        );

        nextGameButton.textContent =
            "SERIES COMPLETE";
    }
}


function renderFinalPicks(
    container,
    picks
) {

    container.innerHTML = "";


    picks.forEach(
        champion => {

            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "final-pick";


            element.innerHTML = `

                <img
                    src="${getChampionImage(champion)}"
                    alt="${champion.name}"
                >

                <span>
                    ${champion.name}
                </span>

            `;


            container.appendChild(
                element
            );
        }
    );
}


/* =========================================================
   NEXT GAME
========================================================= */

nextGameButton.addEventListener(
    "click",
    () => {

        if (
            seriesState.currentGame >=
            seriesState.bestOf
        ) {

            finishSeries();

            return;
        }


        seriesState.currentGame++;


        finalScreen.classList.add(
            "hidden"
        );

        draftScreen.classList.remove(
            "hidden"
        );


        startGame();
    }
);


/* =========================================================
   FINISH SERIES
========================================================= */

function finishSeries() {

    stopTimer();

    alert(
        `${seriesState.blueTeam} vs ${seriesState.redTeam}\n\n` +
        `${seriesState.bestOf}경기 시리즈가 종료되었습니다.`
    );


    finalGameTitle.textContent =
        `SERIES COMPLETE — ${seriesState.games.length} GAMES`;


    nextGameButton.textContent =
        "BACK TO SETUP";


    nextGameButton.onclick =
        () => {

            finalScreen.classList.add(
                "hidden"
            );

            setupScreen.classList.remove(
                "hidden"
            );
        };
}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            if (
                !lockPreview.classList.contains(
                    "hidden"
                )
            ) {

                cancelButton.click();
            }
        }


        if (
            event.key === "Enter"
        ) {

            if (
                !lockPreview.classList.contains(
                    "hidden"
                )
            ) {

                lockButton.click();
            }
        }
    }
);


/* =========================================================
   INITIAL
========================================================= */

loadChampionData();
```
