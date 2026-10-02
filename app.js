"use strict";

document.addEventListener("DOMContentLoaded", function () {

    console.log("LoL Draft Simulator 시작");

    /* =====================================================
       DOM
    ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }

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

    const seriesButtons =
        document.querySelectorAll(".series-button");

    const standardMode = $("standardMode");
    const fearlessMode = $("fearlessMode");

    const phaseLabel = $("phaseLabel");
    const timerElement = $("timer");
    const seriesLabel = $("seriesLabel");

    const turnSide = $("turnSide");
    const turnAction = $("turnAction");

    const championSearch = $("championSearch");
    const roleFilter = $("roleFilter");
    const championGrid = $("championGrid");
    const championBrowser = $("championBrowser");

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

    const blueFearlessBans = $("blueFearlessBans");
    const redFearlessBans = $("redFearlessBans");

    const blueFearlessSlots = $("blueFearlessSlots");
    const redFearlessSlots = $("redFearlessSlots");

    const fearlessWarning = $("fearlessWarning");
    const fearlessCount = $("fearlessCount");

    const blueAction = $("blueAction");
    const redAction = $("redAction");

    const draftMessage = $("draftMessage");

    const undoButton = $("undoButton");
    const resetButton = $("resetButton");

    const blueHeaderName = $("blueHeaderName");
    const redHeaderName = $("redHeaderName");

    const bluePanelName = $("bluePanelName");
    const redPanelName = $("redPanelName");

    const blueHeaderLogo = $("blueHeaderLogo");
    const redHeaderLogo = $("redHeaderLogo");

    const finalGameTitle = $("finalGameTitle");

    const finalBlueName = $("finalBlueName");
    const finalRedName = $("finalRedName");

    const finalBlueLogo = $("finalBlueLogo");
    const finalRedLogo = $("finalRedLogo");

    const finalBluePicks = $("finalBluePicks");
    const finalRedPicks = $("finalRedPicks");

    const nextGameArea = $("nextGameArea");
    const nextGameButton = $("nextGameButton");


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

    let selectedLane = "all";

    let currentSavedResult = null;

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

        { type: "ban", team: "blue" },
        { type: "ban", team: "red" },

        { type: "ban", team: "blue" },
        { type: "ban", team: "red" },

        { type: "ban", team: "blue" },
        { type: "ban", team: "red" },

        { type: "pick", team: "blue" },

        { type: "pick", team: "red" },
        { type: "pick", team: "red" },

        { type: "pick", team: "blue" },
        { type: "pick", team: "blue" },

        { type: "pick", team: "red" },

        { type: "ban", team: "red" },
        { type: "ban", team: "blue" },

        { type: "ban", team: "red" },
        { type: "ban", team: "blue" },

        { type: "pick", team: "red" },

        { type: "pick", team: "blue" },
        { type: "pick", team: "blue" },

        { type: "pick", team: "red" }
    ];


    /* =====================================================
       LANE DATA
       
       한 챔피언이 여러 라인에 들어갈 수 있음.
    ===================================================== */

    const LANE_DATA = {

        TOP: [
            "Aatrox",
            "Camille",
            "ChoGath",
            "Darius",
            "DrMundo",
            "Fiora",
            "Garen",
            "Gnar",
            "Gragas",
            "Gwen",
            "Illaoi",
            "Jax",
            "Jayce",
            "Kennen",
            "Kled",
            "Malphite",
            "Maokai",
            "Mordekaiser",
            "Nasus",
            "Olaf",
            "Ornn",
            "Poppy",
            "Quinn",
            "Renekton",
            "Rengar",
            "Riven",
            "Sett",
            "Shen",
            "Singed",
            "Sion",
            "TahmKench",
            "Teemo",
            "Trundle",
            "Tryndamere",
            "Urgot",
            "Vladimir",
            "Volibear",
            "Warwick",
            "Yone",
            "Yorick",
            "K'Sante",
            "KSante",
            "Ambessa",
            "Aurora"
        ],

        JUNGLE: [
            "Amumu",
            "Belveth",
            "Diana",
            "Ekko",
            "Elise",
            "Evelynn",
            "Fiddlesticks",
            "Graves",
            "Hecarim",
            "JarvanIV",
            "Kayn",
            "KhaZix",
            "Kindred",
            "LeeSin",
            "Lillia",
            "MasterYi",
            "Nidalee",
            "Nocturne",
            "Nunu",
            "Olaf",
            "Poppy",
            "Rammus",
            "RekSai",
            "Rengar",
            "Sejuani",
            "Shaco",
            "Shyvana",
            "Skarner",
            "Taliyah",
            "Trundle",
            "Udyr",
            "Vi",
            "Viego",
            "Volibear",
            "Warwick",
            "XinZhao",
            "Zac",
            "Bel'Veth"
        ],

        MID: [
            "Ahri",
            "Akali",
            "Anivia",
            "Annie",
            "AurelionSol",
            "Aurora",
            "Azir",
            "Cassiopeia",
            "Corki",
            "Diana",
            "Ekko",
            "Fizz",
            "Galio",
            "Hwei",
            "Irelia",
            "Kassadin",
            "Katarina",
            "LeBlanc",
            "Lissandra",
            "Lux",
            "Malzahar",
            "Naafiri",
            "Neeko",
            "Orianna",
            "Qiyana",
            "Ryze",
            "Sylas",
            "Syndra",
            "Taliyah",
            "TwistedFate",
            "Veigar",
            "Vex",
            "Viktor",
            "Vladimir",
            "Xerath",
            "Yasuo",
            "Yone",
            "Zed",
            "Zoe"
        ],

        ADC: [
            "Aphelios",
            "Ashe",
            "Caitlyn",
            "Corki",
            "Draven",
            "Ezreal",
            "Jhin",
            "Jinx",
            "KaiSa",
            "Kalista",
            "KogMaw",
            "Lucian",
            "MissFortune",
            "Nilah",
            "Samira",
            "Senna",
            "Sivir",
            "Smolder",
            "Tristana",
            "Twitch",
            "Varus",
            "Vayne",
            "Xayah",
            "Yunara",
            "Zeri"
        ],

        SUPPORT: [
            "Alistar",
            "Bard",
            "Blitzcrank",
            "Brand",
            "Braum",
            "Janna",
            "Karma",
            "Leona",
            "Lulu",
            "Maokai",
            "Milio",
            "Morgana",
            "Nami",
            "Nautilus",
            "Pyke",
            "Rakan",
            "Rell",
            "Renata",
            "Rumble",
            "Senna",
            "Seraphine",
            "Sona",
            "Soraka",
            "TahmKench",
            "Taric",
            "Thresh",
            "Yuumi",
            "Zilean",
            "Zyra"
        ]
    };


    /* =====================================================
       ADD LANE UI
    ===================================================== */

    function createLaneFilter() {

        if (
            document.getElementById(
                "laneFilter"
            )
        ) {
            return;
        }


        const container =
            document.createElement(
                "div"
            );


        container.id =
            "laneFilter";


        container.className =
            "lane-filter";


        const lanes = [
            ["all", "전체"],
            ["TOP", "TOP"],
            ["JUNGLE", "JUNGLE"],
            ["MID", "MID"],
            ["ADC", "ADC"],
            ["SUPPORT", "SUPPORT"]
        ];


        lanes.forEach(
            function (lane) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "lane-button";


                if (
                    lane[0] === "all"
                ) {

                    button.classList.add(
                        "active"
                    );
                }


                button.dataset.lane =
                    lane[0];


                button.textContent =
                    lane[1];


                button.addEventListener(
                    "click",
                    function () {

                        selectedLane =
                            lane[0];


                        document
                            .querySelectorAll(
                                ".lane-button"
                            )
                            .forEach(
                                function (btn) {

                                    btn.classList.remove(
                                        "active"
                                    );
                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        renderChampions();
                    }
                );


                container.appendChild(
                    button
                );
            }
        );


        championBrowser.insertBefore(
            container,
            championGrid
        );
    }


    /* =====================================================
       LANE CHECK
    ===================================================== */

    function championHasLane(
        champion,
        lane
    ) {

        if (
            lane === "all"
        ) {
            return true;
        }


        const list =
            LANE_DATA[lane] || [];


        return list.includes(
            champion.id
        );
    }


    /* =====================================================
       SAVED RESULTS STORAGE
    ===================================================== */

    const STORAGE_KEY =
        "lolDraftSavedResults";


    function getSavedResults() {

        try {

            const data =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!data) {
                return [];
            }


            const parsed =
                JSON.parse(data);


            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(
                "저장 데이터 불러오기 실패",
                error
            );


            return [];
        }
    }


    function setSavedResults(
        results
    ) {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(results)
            );

        } catch (error) {

            console.error(
                "저장 데이터 기록 실패",
                error
            );


            alert(
                "브라우저 저장 공간에 저장하지 못했습니다."
            );
        }
    }


    /* =====================================================
       SAVE CURRENT SERIES
    ===================================================== */

    function saveCurrentSeries() {

        const result = {

            id:
                Date.now(),

            date:
                new Date().toISOString(),

            blueTeam:
                seriesState.blueTeam,

            redTeam:
                seriesState.redTeam,

            bestOf:
                seriesState.bestOf,

            fearless:
                seriesState.fearless,

            games:
                seriesState.games.map(
                    function (game) {

                        return {

                            game:
                                game.game,

                            blueBans:
                                [...game.blueBans],

                            redBans:
                                [...game.redBans],

                            bluePicks:
                                [...game.bluePicks],

                            redPicks:
                                [...game.redPicks]
                        };
                    }
                )
        };


        const results =
            getSavedResults();


        results.unshift(
            result
        );


        setSavedResults(
            results
        );


        currentSavedResult =
            result.id;


        renderSavedResults();


        alert(
            "밴픽 결과가 저장되었습니다."
        );
    }


    /* =====================================================
       DELETE SAVED RESULT
    ===================================================== */

    function deleteSavedResult(
        id
    ) {

        const results =
            getSavedResults();


        const filtered =
            results.filter(
                function (result) {

                    return result.id !== id;
                }
            );


        setSavedResults(
            filtered
        );


        renderSavedResults();
    }


    /* =====================================================
       SAVED RESULT VIEW
    ===================================================== */

    function showSavedResult(
        result
    ) {

        setupScreen.classList.add(
            "hidden"
        );

        draftScreen.classList.add(
            "hidden"
        );

        finalScreen.classList.remove(
            "hidden"
        );


        finalGameTitle.textContent =
            "SAVED DRAFT";


        finalBlueName.textContent =
            result.blueTeam;


        finalRedName.textContent =
            result.redTeam;


        if (
            result.blueLogo
        ) {

            finalBlueLogo.src =
                result.blueLogo;

            finalBlueLogo.hidden =
                false;
        }


        if (
            result.redLogo
        ) {

            finalRedLogo.src =
                result.redLogo;

            finalRedLogo.hidden =
                false;
        }


        nextGameArea.classList.remove(
            "hidden"
        );


        nextGameButton.textContent =
            "BACK TO HOME";


        finalBluePicks.innerHTML =
            "";

        finalRedPicks.innerHTML =
            "";


        renderSavedSeriesDetails(
            result
        );
    }


    /* =====================================================
       SAVED SERIES DETAILS
    ===================================================== */

    function renderSavedSeriesDetails(
        result
    ) {

        let container =
            document.getElementById(
                "savedSeriesDetails"
            );


        if (!container) {

            container =
                document.createElement(
                    "div"
                );


            container.id =
                "savedSeriesDetails";


            container.className =
                "saved-series-details";


            finalScreen.appendChild(
                container
            );
        }


        container.innerHTML =
            "";


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "saved-series-mode";


        title.textContent =
            "BO" +
            result.bestOf +
            " · " +
            (
                result.fearless
                    ? "FEARLESS"
                    : "STANDARD"
            );


        container.appendChild(
            title
        );


        result.games.forEach(
            function (game) {

                const gameBox =
                    document.createElement(
                        "div"
                    );


                gameBox.className =
                    "saved-game";


                const heading =
                    document.createElement(
                        "h3"
                    );


                heading.textContent =
                    "GAME " +
                    game.game;


                gameBox.appendChild(
                    heading
                );


                const teams =
                    document.createElement(
                        "div"
                    );


                teams.className =
                    "saved-game-teams";


                const blue =
                    createSavedTeamBlock(
                        result.blueTeam,
                        game.bluePicks,
                        game.blueBans
                    );


                const red =
                    createSavedTeamBlock(
                        result.redTeam,
                        game.redPicks,
                        game.redBans
                    );


                teams.appendChild(
                    blue
                );


                teams.appendChild(
                    red
                );


                gameBox.appendChild(
                    teams
                );


                container.appendChild(
                    gameBox
                );
            }
        );
    }


    /* =====================================================
       SAVED TEAM BLOCK
    ===================================================== */

    function createSavedTeamBlock(
        teamName,
        picks,
        bans
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "saved-team-block";


        const title =
            document.createElement(
                "h4"
            );


        title.textContent =
            teamName;


        wrapper.appendChild(
            title
        );


        const banTitle =
            document.createElement(
                "div"
            );


        banTitle.className =
            "saved-section-title";


        banTitle.textContent =
            "BANS";


        wrapper.appendChild(
            banTitle
        );


        const banGrid =
            document.createElement(
                "div"
            );


        banGrid.className =
            "saved-champion-grid";


        bans.forEach(
            function (champion) {

                banGrid.appendChild(
                    createSavedChampion(
                        champion,
                        true
                    )
                );
            }
        );


        wrapper.appendChild(
            banGrid
        );


        const pickTitle =
            document.createElement(
                "div"
            );


        pickTitle.className =
            "saved-section-title";


        pickTitle.textContent =
            "PICKS";


        wrapper.appendChild(
            pickTitle
        );


        const pickGrid =
            document.createElement(
                "div"
            );


        pickGrid.className =
            "saved-champion-grid";


        picks.forEach(
            function (champion) {

                pickGrid.appendChild(
                    createSavedChampion(
                        champion,
                        false
                    )
                );
            }
        );


        wrapper.appendChild(
            pickGrid
        );


        return wrapper;
    }


    /* =====================================================
       SAVED CHAMPION
    ===================================================== */

    function createSavedChampion(
        champion,
        isBan
    ) {

        const element =
            document.createElement(
                "div"
            );


        element.className =
            "saved-champion";


        if (isBan) {

            element.classList.add(
                "saved-ban"
            );
        }


        const image =
            document.createElement(
                "img"
            );


        image.src =
            champion.image;


        image.alt =
            champion.name;


        const name =
            document.createElement(
                "span"
            );


        name.textContent =
            champion.name;


        element.appendChild(
            image
        );


        element.appendChild(
            name
        );


        return element;
    }


    /* =====================================================
       SAVED RESULT LIST
    ===================================================== */

    function createSavedResultsArea() {

        let area =
            document.getElementById(
                "savedResultsArea"
            );


        if (area) {
            return area;
        }


        area =
            document.createElement(
                "section"
            );


        area.id =
            "savedResultsArea";


        area.className =
            "saved-results-area";


        setupScreen.appendChild(
            area
        );


        return area;
    }


    function renderSavedResults() {

        const area =
            createSavedResultsArea();


        const results =
            getSavedResults();


        area.innerHTML =
            "";


        const heading =
            document.createElement(
                "h2"
            );


        heading.textContent =
            "저장된 밴픽";


        area.appendChild(
            heading
        );


        if (
            results.length === 0
        ) {

            const empty =
                document.createElement(
                    "p"
                );


            empty.textContent =
                "저장된 밴픽 결과가 없습니다.";


            empty.className =
                "saved-empty";


            area.appendChild(
                empty
            );


            return;
        }


        results.forEach(
            function (result) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "saved-result-item";


                const info =
                    document.createElement(
                        "div"
                    );


                info.className =
                    "saved-result-info";


                const title =
                    document.createElement(
                        "strong"
                    );


                title.textContent =
                    result.blueTeam +
                    " vs " +
                    result.redTeam;


                const date =
                    document.createElement(
                        "span"
                    );


                date.textContent =
                    formatDate(
                        result.date
                    );


                const mode =
                    document.createElement(
                        "span"
                    );


                mode.textContent =
                    "BO" +
                    result.bestOf +
                    " · " +
                    (
                        result.fearless
                            ? "FEARLESS"
                            : "STANDARD"
                    );


                info.appendChild(
                    title
                );

                info.appendChild(
                    date
                );

                info.appendChild(
                    mode
                );


                const buttons =
                    document.createElement(
                        "div"
                    );


                buttons.className =
                    "saved-result-buttons";


                const viewButton =
                    document.createElement(
                        "button"
                    );


                viewButton.type =
                    "button";


                viewButton.textContent =
                    "보기";


                viewButton.addEventListener(
                    "click",
                    function () {

                        showSavedResult(
                            result
                        );
                    }
                );


                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.type =
                    "button";


                deleteButton.textContent =
                    "삭제";


                deleteButton.addEventListener(
                    "click",
                    function () {

                        const confirmed =
                            confirm(
                                "이 저장 결과를 삭제할까요?"
                            );


                        if (
                            confirmed
                        ) {

                            deleteSavedResult(
                                result.id
                            );
                        }
                    }
                );


                buttons.appendChild(
                    viewButton
                );


                buttons.appendChild(
                    deleteButton
                );


                item.appendChild(
                    info
                );


                item.appendChild(
                    buttons
                );


                area.appendChild(
                    item
                );
            }
        );
    }


    function formatDate(
        date
    ) {

        try {

            return new Date(
                date
            ).toLocaleString(
                "ko-KR"
            );

        } catch {

            return "";
        }
    }


    /* =====================================================
       SERIES BUTTONS
    ===================================================== */

    seriesButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const value =
                        Number(
                            button.dataset.series
                        );


                    if (
                        ![1, 3, 5].includes(
                            value
                        )
                    ) {

                        return;
                    }


                    selectedSeries =
                        value;


                    seriesButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );
                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    console.log(
                        "BO:",
                        selectedSeries
                    );
                }
            );
        }
    );


    /* =====================================================
       MODE
    ===================================================== */

    standardMode.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            fearlessEnabled =
                false;


            standardMode.classList.add(
                "active"
            );

            fearlessMode.classList.remove(
                "active"
            );
        }
    );


    fearlessMode.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            fearlessEnabled =
                true;


            fearlessMode.classList.add(
                "active"
            );

            standardMode.classList.remove(
                "active"
            );
        }
    );


    /* =====================================================
       LOGO
    ===================================================== */

    blueLogoInput.addEventListener(
        "change",
        function () {

            const file =
                blueLogoInput.files[0];


            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

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
        function () {

            const file =
                redLogoInput.files[0];


            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

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
        function (event) {

            event.preventDefault();


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


            currentSavedResult =
                null;


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


        championBrowser.classList.remove(
            "hidden"
        );


        seriesLabel.textContent =
            "GAME " +
            seriesState.currentGame;


        renderAll();

        startTimer();
    }


    /* =====================================================
       CURRENT STEP
    ===================================================== */

    function currentStep() {

        if (!gameState) {
            return null;
        }


        return DRAFT_ORDER[
            gameState.step
        ];
    }


    /* =====================================================
       FEARLESS IDS
    ===================================================== */

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


    /* =====================================================
       SELECTED IDS
    ===================================================== */

    function getSelectedIds() {

        const ids =
            new Set();


        if (!gameState) {
            return ids;
        }


        [
            ...gameState.blueBans,
            ...gameState.redBans,
            ...gameState.bluePicks,
            ...gameState.redPicks
        ].forEach(
            function (champion) {

                ids.add(
                    champion.id
                );
            }
        );


        getFearlessIds().forEach(
            function (id) {

                ids.add(id);
            }
        );


        return ids;
    }


    /* =====================================================
       DATA DRAGON
    ===================================================== */

    async function loadChampionData() {

        try {

            const versionResponse =
                await fetch(
                    "https://ddragon.leagueoflegends.com/api/versions.json"
                );


            const versions =
                await versionResponse.json();


            latestVersion =
                versions[0];


            const response =
                await fetch(
                    "https://ddragon.leagueoflegends.com/cdn/" +
                    latestVersion +
                    "/data/ko_KR/champion.json"
                );


            const data =
                await response.json();


            champions =
                Object.values(
                    data.data
                );


            renderChampions();

        } catch (error) {

            console.error(
                "챔피언 데이터 오류:",
                error
            );


            championGrid.innerHTML = `
                <div class="champion-load-error">
                    챔피언 데이터를 불러오지 못했습니다.
                </div>
            `;
        }
    }


    /* =====================================================
       IMAGE
    ===================================================== */

    function getChampionImage(
        champion
    ) {

        return (
            "https://ddragon.leagueoflegends.com/cdn/" +
            latestVersion +
            "/img/champion/" +
            champion.image.full
        );
    }


    /* =====================================================
       CHAMPION RENDER
    ===================================================== */

    function renderChampions() {

        championGrid.innerHTML =
            "";


        if (
            !champions.length
        ) {

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


        const filtered =
            champions.filter(
                function (champion) {

                    const name =
                        champion.name
                            .toLowerCase();


                    const id =
                        champion.id
                            .toLowerCase();


                    const searchMatch =
                        name.includes(
                            keyword
                        ) ||
                        id.includes(
                            keyword
                        );


                    const tags =
                        champion.tags || [];


                    const roleMatch =
                        role === "all" ||
                        tags.includes(
                            role
                        );


                    const laneMatch =
                        championHasLane(
                            champion,
                            selectedLane
                        );


                    return (
                        searchMatch &&
                        roleMatch &&
                        laneMatch
                    );
                }
            );


        filtered.forEach(
            function (champion) {

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
                        function () {

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
    }


    /* =====================================================
       PREVIEW
    ===================================================== */

    function previewChampion(
        champion
    ) {

        if (
            !gameState ||
            gameState.locked
        ) {
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
            getChampionImage(
                champion
            );


        previewName.textContent =
            champion.name;


        previewRole.textContent =
            (
                champion.tags || []
            ).join(" / ");


        lockPreview.classList.remove(
            "hidden"
        );


        championBrowser.classList.add(
            "hidden"
        );
    }


    /* =====================================================
       CANCEL
    ===================================================== */

    cancelButton.addEventListener(
        "click",
        function () {

            selectedChampion =
                null;


            lockPreview.classList.add(
                "hidden"
            );


            championBrowser.classList.remove(
                "hidden"
            );
        }
    );


    /* =====================================================
       LOCK
    ===================================================== */

    lockButton.addEventListener(
        "click",
        function () {

            if (
                !selectedChampion ||
                !gameState
            ) {
                return;
            }


            const step =
                currentStep();


            if (!step) {
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


            championBrowser.classList.remove(
                "hidden"
            );


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
       TIMER
    ===================================================== */

    function startTimer() {

        stopTimer();


        timer =
            30;


        timerElement.textContent =
            timer;


        timerInterval =
            setInterval(
                function () {

                    timer--;

                    timerElement.textContent =
                        timer;


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
            timerInterval !== null
        ) {

            clearInterval(
                timerInterval
            );


            timerInterval =
                null;
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
                function (champion) {

                    return !unavailable.has(
                        champion.id
                    );
                }
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

        blueBans.innerHTML =
            "";

        redBans.innerHTML =
            "";


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

        bluePicks.innerHTML =
            "";

        redPicks.innerHTML =
            "";


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
            return;
        }


        const isBlue =
            step.team === "blue";


        turnSide.textContent =
            isBlue
                ? seriesState.blueTeam
                : seriesState.redTeam;


        turnAction.textContent =
            step.type.toUpperCase();


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


        phaseLabel.textContent =
            step.type === "ban"
                ? (
                    banCount < 6
                        ? "BAN PHASE 1"
                        : "BAN PHASE 2"
                )
                : "PICK PHASE";


        draftMessage.textContent =
            (
                isBlue
                    ? seriesState.blueTeam
                    : seriesState.redTeam
            ) +
            " " +
            step.type.toUpperCase();
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


        blueFearlessSlots.innerHTML =
            "";

        redFearlessSlots.innerHTML =
            "";


        champions
            .filter(
                function (champion) {

                    return ids.has(
                        champion.id
                    );
                }
            )
            .forEach(
                function (champion) {

                    const image =
                        getChampionImage(
                            champion
                        );


                    blueFearlessSlots.innerHTML += `
                        <div class="ban-slot fearless-slot">
                            <img
                                src="${image}"
                                title="${champion.name}"
                                alt="${champion.name}"
                            >
                        </div>
                    `;


                    redFearlessSlots.innerHTML += `
                        <div class="ban-slot fearless-slot">
                            <img
                                src="${image}"
                                title="${champion.name}"
                                alt="${champion.name}"
                            >
                        </div>
                    `;
                }
            );


        fearlessCount.textContent =
            ids.size +
            " champions unavailable";
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    championSearch.addEventListener(
        "input",
        renderChampions
    );


    roleFilter.addEventListener(
        "change",
        renderChampions
    );


    /* =====================================================
       UNDO
    ===================================================== */

    undoButton.addEventListener(
        "click",
        function () {

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


            championBrowser.classList.remove(
                "hidden"
            );


            renderAll();

            startTimer();
        }
    );


    /* =====================================================
       RESET
    ===================================================== */

    resetButton.addEventListener(
        "click",
        function () {

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
                function (champion) {

                    seriesState.previousPickedIds.add(
                        champion.id
                    );
                }
            );


            gameState.redPicks.forEach(
                function (champion) {

                    seriesState.previousPickedIds.add(
                        champion.id
                    );
                }
            );
        }


        const savedGame = {

            game:
                seriesState.currentGame,

            blueBans:
                serializeChampions(
                    gameState.blueBans
                ),

            redBans:
                serializeChampions(
                    gameState.redBans
                ),

            bluePicks:
                serializeChampions(
                    gameState.bluePicks
                ),

            redPicks:
                serializeChampions(
                    gameState.redPicks
                )
        };


        seriesState.games.push(
            savedGame
        );


        showFinalScreen();
    }


    /* =====================================================
       SERIALIZE CHAMPIONS
    ===================================================== */

    function serializeChampions(
        list
    ) {

        return list.map(
            function (champion) {

                return {

                    id:
                        champion.id,

                    name:
                        champion.name,

                    image:
                        getChampionImage(
                            champion
                        )
                };
            }
        );
    }


    /* =====================================================
       FINAL SCREEN
    ===================================================== */

    function showFinalScreen() {

        draftScreen.classList.add(
            "hidden"
        );


        finalScreen.classList.remove(
            "hidden"
        );


        finalGameTitle.textContent =
            "GAME " +
            seriesState.currentGame;


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


        finalBluePicks.innerHTML =
            "";

        finalRedPicks.innerHTML =
            "";


        const game =
            seriesState.games[
                seriesState.games.length - 1
            ];


        renderFinalTeam(
            finalBluePicks,
            game.bluePicks,
            game.blueBans,
            "blue"
        );


        renderFinalTeam(
            finalRedPicks,
            game.redPicks,
            game.redBans,
            "red"
        );


        createSaveButton();


        if (
            seriesState.currentGame <
            seriesState.bestOf
        ) {

            nextGameArea.classList.remove(
                "hidden"
            );


            nextGameButton.textContent =
                "GAME " +
                (
                    seriesState.currentGame +
                    1
                );

        } else {

            nextGameArea.classList.remove(
                "hidden"
            );


            nextGameButton.textContent =
                "SERIES COMPLETE";
        }
    }


    /* =====================================================
       FINAL TEAM
    ===================================================== */

    function renderFinalTeam(
        container,
        picks,
        bans,
        side
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "final-team-result";


        const banTitle =
            document.createElement(
                "h3"
            );


        banTitle.textContent =
            "BANS";


        wrapper.appendChild(
            banTitle
        );


        const banGrid =
            document.createElement(
                "div"
            );


        banGrid.className =
            "final-champion-grid";


        bans.forEach(
            function (champion) {

                banGrid.appendChild(
                    createSavedChampion(
                        champion,
                        true
                    )
                );
            }
        );


        wrapper.appendChild(
            banGrid
        );


        const pickTitle =
            document.createElement(
                "h3"
            );


        pickTitle.textContent =
            "PICKS";


        wrapper.appendChild(
            pickTitle
        );


        const pickGrid =
            document.createElement(
                "div"
            );


        pickGrid.className =
            "final-champion-grid";


        picks.forEach(
            function (champion) {

                pickGrid.appendChild(
                    createSavedChampion(
                        champion,
                        false
                    )
                );
            }
        );


        wrapper.appendChild(
            pickGrid
        );


        container.appendChild(
            wrapper
        );
    }


    /* =====================================================
       SAVE BUTTON
    ===================================================== */

    function createSaveButton() {

        let button =
            document.getElementById(
                "saveResultButton"
            );


        if (!button) {

            button =
                document.createElement(
                    "button"
                );


            button.id =
                "saveResultButton";


            button.className =
                "save-result-button";


            button.type =
                "button";


            button.textContent =
                "결과 저장";


            finalScreen.appendChild(
                button
            );


            button.addEventListener(
                "click",
                function () {

                    saveSeriesWithLogos();
                }
            );
        }
    }


    /* =====================================================
       SAVE WITH LOGOS
    ===================================================== */

    function saveSeriesWithLogos() {

        const result = {

            id:
                Date.now(),

            date:
                new Date().toISOString(),

            blueTeam:
                seriesState.blueTeam,

            redTeam:
                seriesState.redTeam,

            bestOf:
                seriesState.bestOf,

            fearless:
                seriesState.fearless,

            blueLogo:
                blueLogoData,

            redLogo:
                redLogoData,

            games:
                seriesState.games.map(
                    function (game) {

                        return {

                            game:
                                game.game,

                            blueBans:
                                [...game.blueBans],

                            redBans:
                                [...game.redBans],

                            bluePicks:
                                [...game.bluePicks],

                            redPicks:
                                [...game.redPicks]
                        };
                    }
                )
        };


        const results =
            getSavedResults();


        results.unshift(
            result
        );


        setSavedResults(
            results
        );


        currentSavedResult =
            result.id;


        renderSavedResults();


        const button =
            document.getElementById(
                "saveResultButton"
            );


        if (button) {

            button.textContent =
                "저장 완료";
        }


        alert(
            "밴픽 결과가 저장되었습니다."
        );
    }


    /* =====================================================
       NEXT GAME / HOME
    ===================================================== */

    nextGameButton.addEventListener(
        "click",
        function () {

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


            stopTimer();


            finalScreen.classList.add(
                "hidden"
            );


            draftScreen.classList.add(
                "hidden"
            );


            setupScreen.classList.remove(
                "hidden"
            );


            renderSavedResults();
        }
    );


    /* =====================================================
       DYNAMIC STYLE
       
       챔피언 스크롤 문제가 기존 CSS에 남아 있어도
       강제로 정상 작동하도록 함.
    ===================================================== */

    const dynamicStyle =
        document.createElement(
            "style"
        );


    dynamicStyle.textContent = `

        .champion-browser {
            min-height: 0;
            overflow: hidden;
        }

        #championGrid {
            max-height: 520px;
            overflow-y: auto;
            overflow-x: hidden;
            padding-right: 8px;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            touch-action: pan-y;
        }

        #championGrid::-webkit-scrollbar {
            width: 8px;
        }

        #championGrid::-webkit-scrollbar-thumb {
            border-radius: 10px;
        }

        .lane-filter {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin: 10px 0 14px;
        }

        .lane-button {
            border: 1px solid rgba(255,255,255,.12);
            background: rgba(255,255,255,.04);
            color: #9ba5b5;
            padding: 8px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
        }

        .lane-button:hover,
        .lane-button.active {
            color: white;
            border-color: #c89b3c;
            background: rgba(200,155,60,.14);
        }

        .champion.unavailable {
            opacity: .22;
            filter: grayscale(1);
            cursor: not-allowed;
        }

        .champion-load-error {
            padding: 40px;
            text-align: center;
        }

        .final-team-result {
            margin-top: 24px;
        }

        .final-champion-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 10px 0 20px;
        }

        .saved-champion {
            width: 72px;
            text-align: center;
            font-size: 11px;
        }

        .saved-champion img {
            width: 58px;
            height: 58px;
            object-fit: cover;
            display: block;
            margin: 0 auto 4px;
        }

        .saved-ban img {
            filter: grayscale(1);
            opacity: .55;
        }

        .saved-series-details {
            margin-top: 25px;
        }

        .saved-game {
            margin-top: 20px;
            padding: 18px;
            border: 1px solid rgba(255,255,255,.08);
            border-radius: 8px;
        }

        .saved-game-teams {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .saved-team-block {
            min-width: 0;
        }

        .saved-champion-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
        }

        .saved-section-title {
            font-size: 11px;
            margin: 12px 0 6px;
            opacity: .7;
        }

        .save-result-button {
            margin-top: 20px;
            padding: 12px 24px;
            border: 1px solid #c89b3c;
            background: #c89b3c;
            color: #111;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 700;
        }

        .saved-results-area {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid rgba(255,255,255,.08);
        }

        .saved-result-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 15px;
            margin-top: 10px;
            border: 1px solid rgba(255,255,255,.08);
            border-radius: 8px;
        }

        .saved-result-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .saved-result-info span {
            font-size: 11px;
            opacity: .65;
        }

        .saved-result-buttons {
            display: flex;
            gap: 7px;
        }

        .saved-result-buttons button {
            padding: 7px 12px;
            cursor: pointer;
        }

        .saved-empty {
            opacity: .5;
        }

        @media (max-width: 800px) {

            #championGrid {
                max-height: 420px;
            }

            .saved-game-teams {
                grid-template-columns: 1fr;
            }

            .saved-result-item {
                flex-direction: column;
                align-items: stretch;
            }

            .saved-result-buttons {
                width: 100%;
            }

            .saved-result-buttons button {
                flex: 1;
            }
        }
    `;


    document.head.appendChild(
        dynamicStyle
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    createLaneFilter();

    renderSavedResults();

    loadChampionData();


    console.log(
        "초기화 완료"
    );

});