```javascript
"use strict";

/* =========================================================
   LoL Draft Simulator
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       DOM
    ===================================================== */

    const $ = (id) => document.getElementById(id);


    /* Setup */

    const setupScreen = $("setupScreen");
    const draftScreen = $("draftScreen");
    const finalScreen = $("finalScreen");

    const blueTeamNameInput = $("blueTeamName");
    const redTeamNameInput = $("redTeamName");

    const blueLogoInput = $("blueLogo");
    const redLogoInput = $("redLogo");

    const blueLogoPreview = $("blueLogoPreview");
    const redLogoPreview = $("redLogoPreview");

    const blueLogoText = $("blueLogoText");
    const redLogoText = $("redLogoText");

    const startDraftButton = $("startDraft");


    /* Series */

    const seriesButtons =
        document.querySelectorAll(".series-button");

    const standardMode =
        $("standardMode");

    const fearlessMode =
        $("fearlessMode");


    /* Draft */

    const phaseLabel = $("phaseLabel");
    const timerElement = $("timer");
    const seriesLabel = $("seriesLabel");

    const turnSide = $("turnSide");
    const turnAction = $("turnAction");

    const championSearch =
        $("championSearch");

    const roleFilter =
        $("roleFilter");

    const championGrid =
        $("championGrid");

    const lockPreview =
        $("lockPreview");

    const previewImage =
        $("previewImage");

    const previewName =
        $("previewName");

    const previewRole =
        $("previewRole");

    const lockButton =
        $("lockButton");

    const cancelButton =
        $("cancelButton");

    const blueBans =
        $("blueBans");

    const redBans =
        $("redBans");

    const bluePicks =
        $("bluePicks");

    const redPicks =
        $("redPicks");

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

    const blueAction =
        $("blueAction");

    const redAction =
        $("redAction");

    const draftMessage =
        $("draftMessage");

    const undoButton =
        $("undoButton");

    const resetButton =
        $("resetButton");


    /* Header */

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


    /* Final */

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


    /* =====================================================
       STATE
    ===================================================== */

    let selectedSeries = 1;

    let fearlessEnabled = false;

    let blueLogoData = null;

    let redLogoData = null;

    let champions = [];

    let latestVersion = "";

    let selectedChampion = null;

    let timer = 30;

    let timerInterval = null;

    let history = [];


    let seriesState = {

        blueTeam: "BLUE TEAM",

        redTeam: "RED TEAM",

        bestOf: 1,

        fearless: false,

        currentGame: 1,

        games: [],

        previousPickedIds: new Set()
    };


    let gameState = null;


    /* =====================================================
       DRAFT ORDER
    ===================================================== */

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


    /* =====================================================
       CHECK DOM
    ===================================================== */

    const requiredElements = [

        setupScreen,
        draftScreen,
        finalScreen,

        blueTeamNameInput,
        redTeamNameInput,

        startDraftButton,

        standardMode,
        fearlessMode,

        phaseLabel,
        timerElement,

        championSearch,
        roleFilter,
        championGrid,

        lockPreview,
        previewImage,
        previewName,
        previewRole,

        lockButton,
        cancelButton,

        blueBans,
        redBans,

        bluePicks,
        redPicks
    ];


    const missingElements =
        requiredElements.filter(
            element => !element
        );


    if (missingElements.length > 0) {

        console.error(
            "필요한 HTML 요소를 찾을 수 없습니다.",
            missingElements
        );

        alert(
            "HTML과 app.js의 연결에 문제가 있습니다.\n" +
            "F12 → Console에서 오류를 확인해주세요."
        );

        return;
    }


    /* =====================================================
       SERIES BUTTON
    ===================================================== */

    seriesButtons.forEach(button => {

        button.addEventListener("click", () => {

            seriesButtons.forEach(
                btn => btn.classList.remove("active")
            );

            button.classList.add("active");

            selectedSeries =
                Number(button.dataset.series);

            console.log(
                "선택된 시리즈:",
                selectedSeries
            );
        });

    });


    /* =====================================================
       STANDARD
    ===================================================== */

    standardMode.addEventListener(
        "click",
        () => {

            fearlessEnabled = false;

            standardMode.classList.add(
                "active"
            );

            fearlessMode.classList.remove(
                "active"
            );

            console.log(
                "Draft Mode: STANDARD"
            );
        }
    );


    /* =====================================================
       FEARLESS
    ===================================================== */

    fearlessMode.addEventListener(
        "click",
        () => {

            fearlessEnabled = true;

            fearlessMode.classList.add(
                "active"
            );

            standardMode.classList.remove(
                "active"
            );

            console.log(
                "Draft Mode: FEARLESS"
            );
        }
    );


    /* =====================================================
       LOGO
    ===================================================== */

    blueLogoInput.addEventListener(
        "change",
        () => {

            const file =
                blueLogoInput.files[0];

            if (!file) return;

            const reader =
                new FileReader();

            reader.onload = (event) => {

                blueLogoData =
                    event.target.result;

                blueLogoPreview.src =
                    blueLogoData;

                blueLogoPreview.hidden =
                    false;

                blueLogoText.textContent =
                    file.name;
            };

            reader.readAsDataURL(file);
        }
    );


    redLogoInput.addEventListener(
        "change",
        () => {

            const file =
                redLogoInput.files[0];

            if (!file) return;

            const reader =
                new FileReader();

            reader.onload = (event) => {

                redLogoData =
                    event.target.result;

                redLogoPreview.src =
                    redLogoData;

                redLogoPreview.hidden =
                    false;

                redLogoText.textContent =
                    file.name;
            };

            reader.readAsDataURL(file);
        }
    );


    /* =====================================================
       START DRAFT
    ===================================================== */

    startDraftButton.addEventListener(
        "click",
        () => {

            console.log(
                "DRAFT START 클릭"
            );

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

            draftScreen.classList.remove(
                "hidden"
            );

            finalScreen.classList.add(
                "hidden"
            );


            startGame();
        }
    );


    /* =====================================================
       TEAM NAMES
    ===================================================== */

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


    /* =====================================================
       START GAME
    ===================================================== */

    function startGame() {

        console.log(
            "GAME START:",
            seriesState.currentGame
        );


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


        seriesLabel.textContent =
            `GAME ${seriesState.currentGame}`;


        renderAll();

        startTimer();
    }


    /* =====================================================
       CURRENT STEP
    ===================================================== */

    function currentStep() {

        return DRAFT_ORDER[
            gameState.step
        ];
    }


    /* =====================================================
       FEARLESS IDS
    ===================================================== */

    function getFearlessIds() {

        if (!seriesState.fearless) {

            return new Set();
        }

        return new Set(
            seriesState.previousPickedIds
        );
    }


    /* =====================================================
       SELECTED CHAMPIONS
    ===================================================== */

    function getSelectedIds() {

        const ids =
            new Set();


        gameState.blueBans.forEach(
            champion => ids.add(champion.id)
        );

        gameState.redBans.forEach(
            champion => ids.add(champion.id)
        );

        gameState.bluePicks.forEach(
            champion => ids.add(champion.id)
        );

        gameState.redPicks.forEach(
            champion => ids.add(champion.id)
        );

        getFearlessIds().forEach(
            id => ids.add(id)
        );


        return ids;
    }


    /* =====================================================
       DATA DRAGON
    ===================================================== */

    async function loadChampionData() {

        try {

            console.log(
                "챔피언 데이터 로딩..."
            );


            const versionResponse =
                await fetch(
                    "https://ddragon.leagueoflegends.com/api/versions.json"
                );


            if (!versionResponse.ok) {

                throw new Error(
                    "Data Dragon 버전 요청 실패"
                );
            }


            const versions =
                await versionResponse.json();


            latestVersion =
                versions[0];


            const championResponse =
                await fetch(
                    `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/ko_KR/champion.json`
                );


            if (!championResponse.ok) {

                throw new Error(
                    "챔피언 데이터 요청 실패"
                );
            }


            const data =
                await championResponse.json();


            champions =
                Object.values(
                    data.data
                );


            console.log(
                `챔피언 ${champions.length}명 로딩 완료`
            );


            renderChampions();


        } catch (error) {

            console.error(
                "챔피언 데이터 로딩 실패:",
                error
            );


            championGrid.innerHTML = `
                <div style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:40px;
                    color:#ed4b58;
                ">
                    챔피언 데이터를 불러오지 못했습니다.<br>
                    인터넷 연결 또는 Data Dragon 상태를 확인해주세요.
                </div>
            `;
        }
    }


    /* =====================================================
       CHAMPION IMAGE
    ===================================================== */

    function getChampionImage(champion) {

        return (
            "https://ddragon.leagueoflegends.com/cdn/" +
            latestVersion +
            "/img/champion/" +
            champion.image.full
        );
    }


    /* =====================================================
       RENDER CHAMPIONS
    ===================================================== */

    function renderChampions() {

        if (!champions.length) {

            championGrid.innerHTML = `
                <div style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:40px;
                    color:#737d8b;
                ">
                    챔피언 데이터를 불러오는 중...
                </div>
            `;

            return;
        }


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

                    const nameMatch =
                        champion.name
                            .toLowerCase()
                            .includes(keyword)
                        ||
                        champion.id
                            .toLowerCase()
                            .includes(keyword);


                    const roleMatch =
                        role === "all"
                        ||
                        champion.tags.includes(
                            role
                        );


                    return (
                        nameMatch &&
                        roleMatch
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


                const unavailableChampion =
                    unavailable.has(
                        champion.id
                    );


                if (
                    unavailableChampion
                ) {

                    element.classList.add(
                        "unavailable"
                    );

                } else {

                    element.addEventListener(
                        "click",
                        () => {
                            previewChampion(
                                champion
                            );
                        }
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


    /* =====================================================
       PREVIEW
    ===================================================== */

    function previewChampion(champion) {

        if (!gameState) return;

        if (gameState.locked) return;


        const step =
            currentStep();


        if (!step) return;


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
            champion.tags.join(" / ");


        lockPreview.classList.remove(
            "hidden"
        );


        championGrid.parentElement
            .classList.add("hidden");
    }


    /* =====================================================
       CANCEL
    ===================================================== */

    cancelButton.addEventListener(
        "click",
        () => {

            selectedChampion =
                null;

            lockPreview.classList.add(
                "hidden"
            );

            championGrid.parentElement
                .classList.remove("hidden");
        }
    );


    /* =====================================================
       LOCK
    ===================================================== */

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


            if (!step) return;


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
            }


            selectedChampion =
                null;


            lockPreview.classList.add(
                "hidden"
            );


            championGrid.parentElement
                .classList.remove("hidden");


            gameState.step++;


            if (
                gameState.step >=
                DRAFT_ORDER.length
            ) {

                finishGame();

            } else {

                renderAll();

                startTimer();
            }
        }
    );


    /* =====================================================
       HISTORY
    ===================================================== */

    function saveHistory() {

        history.push({

            step:
                gameState.step,

            blueBans:
                [...gameState.blueBans],

            redBans:
                [...gameState.redBans],

            bluePicks:
                [...gameState.bluePicks],

            redPicks:
                [...gameState.redPicks],

            locked:
                gameState.locked
        });
    }


    /* =====================================================
       UNDO
    ===================================================== */

    undoButton.addEventListener(
        "click",
        () => {

            if (
                history.length === 0
            ) {

                return;
            }


            const previous =
                history.pop();


            gameState = {

                step:
                    previous.step,

                blueBans:
                    [...previous.blueBans],

                redBans:
                    [...previous.redBans],

                bluePicks:
                    [...previous.bluePicks],

                redPicks:
                    [...previous.redPicks],

                locked:
                    previous.locked
            };


            selectedChampion =
                null;


            lockPreview.classList.add(
                "hidden"
            );


            championGrid.parentElement
                .classList.remove("hidden");


            renderAll();

            startTimer();
        }
    );


    /* =====================================================
       TIMER
    ===================================================== */

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

                        autoPick();
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


    /* =====================================================
       AUTO PICK
    ===================================================== */

    function autoPick() {

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


        const random =
            available[
                Math.floor(
                    Math.random() *
                    available.length
                )
            ];


        selectedChampion =
            random;


        lockButton.click();
    }


    /* =====================================================
       RENDER ALL
    ===================================================== */

    function renderAll() {

        renderBans();

        renderPicks();

        renderChampions();

        renderTurn();

        renderFearlessBans();
    }


    /* =====================================================
       BANS
    ===================================================== */

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


    /* =====================================================
       PICKS
    ===================================================== */

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


    /* =====================================================
       TURN
    ===================================================== */

    function renderTurn() {

        const step =
            currentStep();


        if (!step) {

            turnSide.textContent =
                "DRAFT";

            turnAction.textContent =
                "COMPLETE";

            return;
        }


        const isBlue =
            step.team === "blue";


        turnSide.textContent =
            isBlue
                ? seriesState.blueTeam
                : seriesState.redTeam;


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

            phaseLabel.textContent =
                banCount < 6
                    ? "BAN PHASE 1"
                    : "BAN PHASE 2";

        } else {

            phaseLabel.textContent =
                "PICK PHASE";
        }


        draftMessage.textContent =
            `${isBlue
                ? seriesState.blueTeam
                : seriesState.redTeam
            } ${step.type.toUpperCase()}`;
    }


    /* =====================================================
       FEARLESS
    ===================================================== */

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

            fearlessWarning.classList.add(
                "hidden"
            );

            return;
        }


        const ids =
            getFearlessIds();


        if (
            ids.size === 0
        ) {

            blueFearlessBans.classList.add(
                "hidden"
            );

            redFearlessBans.classList.add(
                "hidden"
            );

            fearlessWarning.classList.add(
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

        fearlessWarning.classList.remove(
            "hidden"
        );


        blueFearlessSlots.innerHTML = "";

        redFearlessSlots.innerHTML = "";


        const fearlessChampions =
            champions.filter(
                champion =>
                    ids.has(
                        champion.id
                    )
            );


        fearlessChampions.forEach(
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
                        title="${champion.name}"
                        alt="${champion.name}"
                    >
                `;


                const redSlot =
                    blueSlot.cloneNode(true);


                blueFearlessSlots.appendChild(
                    blueSlot
                );

                redFearlessSlots.appendChild(
                    redSlot
                );
            }
        );


        fearlessCount.textContent =
            `${ids.size} champions unavailable`;
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    championSearch.addEventListener(
        "input",
        () => {
            renderChampions();
        }
    );


    roleFilter.addEventListener(
        "change",
        () => {
            renderChampions();
        }
    );


    /* =====================================================
       RESET
    ===================================================== */

    resetButton.addEventListener(
        "click",
        () => {

            startGame();
        }
    );


    /* =====================================================
       FINISH GAME
    ===================================================== */

    function finishGame() {

        stopTimer();


        gameState.locked =
            true;


        if (
            seriesState.fearless
        ) {

            gameState.bluePicks.forEach(
                champion => {

                    seriesState.previousPickedIds
                        .add(
                            champion.id
                        );
                }
            );


            gameState.redPicks.forEach(
                champion => {

                    seriesState.previousPickedIds
                        .add(
                            champion.id
                        );
                }
            );
        }


        seriesState.games.push({

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
        });


        showFinalScreen();
    }


    /* =====================================================
       FINAL
    ===================================================== */

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


    /* =====================================================
       NEXT GAME
    ===================================================== */

    nextGameButton.addEventListener(
        "click",
        () => {

            if (
                seriesState.currentGame <
                seriesState.bestOf
            ) {

                seriesState.currentGame++;


                finalScreen.classList.add(
                    "hidden"
                );

                draftScreen.classList.remove(
                    "hidden"
                );


                startGame();

                return;
            }


            finalScreen.classList.add(
                "hidden"
            );

            setupScreen.classList.remove(
                "hidden"
            );
        }
    );


    /* =====================================================
       KEYBOARD
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

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


    /* =====================================================
       INITIALIZE
    ===================================================== */

    console.log(
        "LoL Draft Simulator 초기화 완료"
    );


    loadChampionData();

});
```
