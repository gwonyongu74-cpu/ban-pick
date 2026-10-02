document.addEventListener("DOMContentLoaded", function () {
    const $ = (id) => document.getElementById(id);

    /* =========================
       기본 상태
    ========================= */

    let selectedSeries = 1;
    let fearlessEnabled = false;
    let timerEnabled = true;

    let blueLogo = "";
    let redLogo = "";

    let champions = [];
    let latestVersion = "";

    let selectedChampion = null;

    let timer = 30;
    let timerInterval = null;

    let history = [];

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

        { type: "ban2", team: "blue" },
        { type: "ban2", team: "red" },
        { type: "ban2", team: "blue" },
        { type: "ban2", team: "red" },

        { type: "pick", team: "red" },
        { type: "pick", team: "blue" },
        { type: "pick", team: "blue" },
        { type: "pick", team: "red" }
    ];

    let seriesState = {
        blueTeam: "",
        redTeam: "",
        blueLogo: "",
        redLogo: "",
        bestOf: 1,
        fearless: false,
        timerEnabled: true,
        currentGame: 1,
        games: [],
        previousPickedIds: []
    };

    let gameState = {
        bans: {
            blue: [],
            red: []
        },
        picks: {
            blue: [],
            red: []
        },
        currentAction: 0
    };


    /* =========================
       DOM
    ========================= */

    const setupScreen = $("setupScreen");
    const draftScreen = $("draftScreen");
    const finalScreen = $("finalScreen");

    const blueTeamInput = $("blueTeam");
    const redTeamInput = $("redTeam");

    const blueLogoInput = $("blueLogo");
    const redLogoInput = $("redLogo");

    const blueLogoPreview = $("blueLogoPreview");
    const redLogoPreview = $("redLogoPreview");

    const championGrid = $("championGrid");
    const championSearch = $("championSearch");

    const lockPreview = $("lockPreview");
    const lockButton = $("lockButton");
    const cancelButton = $("cancelButton");

    const timerElement = $("timer");

    const undoButton = $("undoButton");
    const resetButton = $("resetButton");

    const finalBlueTeam = $("finalBlueTeam");
    const finalRedTeam = $("finalRedTeam");

    const finalBlueLogo = $("finalBlueLogo");
    const finalRedLogo = $("finalRedLogo");

    const finalBluePicks = $("finalBluePicks");
    const finalRedPicks = $("finalRedPicks");

    const finalBlueBans = $("finalBlueBans");
    const finalRedBans = $("finalRedBans");

    const nextGameButton = $("nextGameButton");

    const saveResultButton = $("saveResultButton");

    const timerEnabledButton = $("timerEnabled");
    const timerDisabledButton = $("timerDisabled");

    const startDraftButton = $("startDraft");

    const boButtons = document.querySelectorAll(".series-button");

    const modeButtons = document.querySelectorAll(
        ".mode-button, .draft-mode-button"
    );


    /* =========================
       초기화
    ========================= */

    setupScreen?.classList.remove("hidden");
    draftScreen?.classList.add("hidden");
    finalScreen?.classList.add("hidden");


    /* =========================
       BO 선택
    ========================= */

    boButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            boButtons.forEach(function (b) {
                b.classList.remove("active");
            });

            button.classList.add("active");

            selectedSeries = Number(button.dataset.series);

            if (![1, 3, 5].includes(selectedSeries)) {
                selectedSeries = 1;
            }
        });
    });


    /* =========================
       Fearless 선택
    ========================= */

    modeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            modeButtons.forEach(function (b) {
                b.classList.remove("active");
            });

            button.classList.add("active");

            const mode =
                button.dataset.mode ||
                button.dataset.type ||
                button.textContent.trim().toLowerCase();

            if (
                mode.includes("fearless") ||
                mode.includes("피어리스")
            ) {
                fearlessEnabled = true;
            } else {
                fearlessEnabled = false;
            }
        });
    });


    /* =========================
       시간 제한 선택
    ========================= */

    if (timerEnabledButton && timerDisabledButton) {
        timerEnabledButton.addEventListener("click", function () {
            timerEnabled = true;

            timerEnabledButton.classList.add("active");
            timerDisabledButton.classList.remove("active");

            if (gameState.currentAction < DRAFT_ORDER.length) {
                startTimer();
            }
        });

        timerDisabledButton.addEventListener("click", function () {
            timerEnabled = false;

            timerDisabledButton.classList.add("active");
            timerEnabledButton.classList.remove("active");

            stopTimer();

            if (timerElement) {
                timerElement.textContent = "∞";
            }
        });
    }


    /* =========================
       로고
    ========================= */

    if (blueLogoInput) {
        blueLogoInput.addEventListener("input", function () {
            blueLogo = blueLogoInput.value.trim();

            if (blueLogoPreview) {
                blueLogoPreview.src = blueLogo;
            }
        });
    }

    if (redLogoInput) {
        redLogoInput.addEventListener("input", function () {
            redLogo = redLogoInput.value.trim();

            if (redLogoPreview) {
                redLogoPreview.src = redLogo;
            }
        });
    }


    /* =========================
       챔피언 데이터
    ========================= */

    async function loadChampions() {
        try {
            const versionResponse = await fetch(
                "https://ddragon.leagueoflegends.com/api/versions.json"
            );

            const versions = await versionResponse.json();

            latestVersion = versions[0];

            const championResponse = await fetch(
                `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/ko_KR/champion.json`
            );

            const championData = await championResponse.json();

            champions = Object.values(championData.data);

            renderChampionGrid();

        } catch (error) {
            console.error("챔피언 데이터를 불러오지 못했습니다.", error);

            if (championGrid) {
                championGrid.innerHTML =
                    '<div class="load-error">챔피언 데이터를 불러오지 못했습니다.</div>';
            }
        }
    }


    /* =========================
       챔피언 이미지
    ========================= */

    function getChampionImage(champion) {
        if (!champion || !latestVersion) {
            return "";
        }

        return `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}`;
    }


    /* =========================
       라인 데이터
    ========================= */

    const LANE_DATA = {
        TOP: [
            "Aatrox",
            "Camille",
            "Chogath",
            "Darius",
            "DrMundo",
            "Fiora",
            "Garen",
            "Gnar",
            "Gragas",
            "Illaoi",
            "Irelia",
            "Jax",
            "Kennen",
            "Kled",
            "Malphite",
            "Mordekaiser",
            "Nasus",
            "Olaf",
            "Ornn",
            "Renekton",
            "Riven",
            "Sett",
            "Shen",
            "Singed",
            "Sion",
            "Teemo",
            "Trundle",
            "Urgot",
            "Volibear",
            "Yone",
            "Yorick"
        ],

        JUNGLE: [
            "Amumu",
            "Belveth",
            "Diana",
            "Ekko",
            "Elise",
            "Evelynn",
            "Graves",
            "Hecarim",
            "JarvanIV",
            "Kayn",
            "KhaZix",
            "Kindred",
            "LeeSin",
            "Lillia",
            "MasterYi",
            "Nocturne",
            "Nunu",
            "RekSai",
            "Rengar",
            "Sejuani",
            "Shaco",
            "Shyvana",
            "Skarner",
            "Taliyah",
            "Viego",
            "Vi",
            "Warwick",
            "XinZhao"
        ],

        MID: [
            "Ahri",
            "Akali",
            "Anivia",
            "Annie",
            "AurelionSol",
            "Aurora",
            "Azir",
            "Brand",
            "Cassiopeia",
            "Corki",
            "Diana",
            "Fizz",
            "Galio",
            "Hwei",
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
            "Syndra",
            "Sylas",
            "Talon",
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
            "Kaisa",
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


    /* =========================
       현재 라인 필터
    ========================= */

    let currentLane = "ALL";


    function createLaneFilter() {
        if (!championGrid) {
            return;
        }

        if (document.getElementById("laneFilter")) {
            return;
        }

        const filter = document.createElement("div");

        filter.id = "laneFilter";
        filter.className = "lane-filter";

        const lanes = [
            ["ALL", "전체"],
            ["TOP", "TOP"],
            ["JUNGLE", "JUNGLE"],
            ["MID", "MID"],
            ["ADC", "ADC"],
            ["SUPPORT", "SUPPORT"]
        ];

        lanes.forEach(function ([value, text]) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "lane-button";

            if (value === "ALL") {
                button.classList.add("active");
            }

            button.dataset.lane = value;
            button.textContent = text;

            button.addEventListener("click", function () {
                document
                    .querySelectorAll(".lane-button")
                    .forEach(function (b) {
                        b.classList.remove("active");
                    });

                button.classList.add("active");

                currentLane = value;

                renderChampionGrid();
            });

            filter.appendChild(button);
        });

        championGrid.parentElement.insertBefore(
            filter,
            championGrid
        );
    }


    /* =========================
       챔피언 사용 가능 여부
    ========================= */

    function isChampionUnavailable(championId) {
        const id = String(championId);

        if (
            gameState.bans.blue.some(
                c => String(c.id) === id
            )
        ) {
            return true;
        }

        if (
            gameState.bans.red.some(
                c => String(c.id) === id
            )
        ) {
            return true;
        }

        if (
            gameState.picks.blue.some(
                c => String(c.id) === id
            )
        ) {
            return true;
        }

        if (
            gameState.picks.red.some(
                c => String(c.id) === id
            )
        ) {
            return true;
        }

        if (
            fearlessEnabled &&
            seriesState.previousPickedIds.includes(id)
        ) {
            return true;
        }

        return false;
    }


    /* =========================
       챔피언 그리드
    ========================= */

    function renderChampionGrid() {
        if (!championGrid) {
            return;
        }

        championGrid.innerHTML = "";

        const searchText =
            championSearch?.value
                ?.trim()
                .toLowerCase() || "";

        let filtered = champions.filter(function (champion) {
            if (searchText) {
                const name =
                    champion.name.toLowerCase();

                const id =
                    champion.id.toLowerCase();

                if (
                    !name.includes(searchText) &&
                    !id.includes(searchText)
                ) {
                    return false;
                }
            }

            if (currentLane !== "ALL") {
                const laneList =
                    LANE_DATA[currentLane] || [];

                if (!laneList.includes(champion.id)) {
                    return false;
                }
            }

            return true;
        });

        filtered.sort(function (a, b) {
            return a.name.localeCompare(
                b.name,
                "ko"
            );
        });

        filtered.forEach(function (champion) {
            const item = document.createElement("button");

            item.type = "button";
            item.className = "champion-item";

            item.dataset.id = champion.id;

            const unavailable =
                isChampionUnavailable(champion.id);

            if (unavailable) {
                item.classList.add("unavailable");
                item.disabled = true;
            }

            const image = document.createElement("img");

            image.src =
                getChampionImage(champion);

            image.alt =
                champion.name;

            const name =
                document.createElement("span");

            name.textContent =
                champion.name;

            item.appendChild(image);
            item.appendChild(name);

            if (!unavailable) {
                item.addEventListener(
                    "click",
                    function () {
                        selectChampion(champion);
                    }
                );
            }

            championGrid.appendChild(item);
        });
    }


    /* =========================
       챔피언 검색
    ========================= */

    if (championSearch) {
        championSearch.addEventListener(
            "input",
            function () {
                renderChampionGrid();
            }
        );
    }


    /* =========================
       챔피언 선택
    ========================= */

    function selectChampion(champion) {
        if (!champion) {
            return;
        }

        if (
            isChampionUnavailable(
                champion.id
            )
        ) {
            return;
        }

        selectedChampion = champion;

        updateLockPreview();
    }


    /* =========================
       선택 미리보기
    ========================= */

    function updateLockPreview() {
        if (!lockPreview) {
            return;
        }

        lockPreview.innerHTML = "";

        if (!selectedChampion) {
            return;
        }

        const image =
            document.createElement("img");

        image.src =
            getChampionImage(
                selectedChampion
            );

        image.alt =
            selectedChampion.name;

        const name =
            document.createElement("span");

        name.textContent =
            selectedChampion.name;

        lockPreview.appendChild(image);
        lockPreview.appendChild(name);
    }


    /* =========================
       현재 행동
    ========================= */

    function getCurrentAction() {
        return DRAFT_ORDER[
            gameState.currentAction
        ];
    }


    /* =========================
       락 버튼
    ========================= */

    if (lockButton) {
        lockButton.addEventListener(
            "click",
            function () {
                if (!selectedChampion) {
                    return;
                }

                const action =
                    getCurrentAction();

                if (!action) {
                    return;
                }

                lockSelectedChampion();
            }
        );
    }


    /* =========================
       선택 취소
    ========================= */

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            function () {
                selectedChampion = null;

                updateLockPreview();
            }
        );
    }


    /* =========================
       챔피언 잠금
    ========================= */

    function lockSelectedChampion() {
        if (!selectedChampion) {
            return;
        }

        const action =
            getCurrentAction();

        if (!action) {
            return;
        }

        const champion =
            selectedChampion;

        const record = {
            actionIndex:
                gameState.currentAction,

            actionType:
                action.type,

            team:
                action.team,

            champion: champion
        };

        history.push(record);

        if (
            action.type === "ban" ||
            action.type === "ban2"
        ) {
            gameState.bans[
                action.team
            ].push(champion);
        } else {
            gameState.picks[
                action.team
            ].push(champion);
        }

        selectedChampion = null;

        updateLockPreview();

        gameState.currentAction++;

        renderChampionGrid();

        updateDraftUI();

        if (
            gameState.currentAction >=
            DRAFT_ORDER.length
        ) {
            finishGame();
            return;
        }

        startTimer();
    }


    /* =========================
       자동 선택
    ========================= */

    function autoPick() {
        const available =
            champions.filter(function (champion) {
                return !isChampionUnavailable(
                    champion.id
                );
            });

        if (available.length === 0) {
            return;
        }

        const random =
            available[
                Math.floor(
                    Math.random() *
                    available.length
                )
            ];

        selectedChampion = random;

        lockSelectedChampion();
    }


    /* =========================
       타이머 시작
    ========================= */

    function startTimer() {
        stopTimer();

        if (!timerEnabled) {
            if (timerElement) {
                timerElement.textContent = "∞";
            }

            return;
        }

        timer = 30;

        if (timerElement) {
            timerElement.textContent =
                timer;
        }

        timerInterval =
            setInterval(function () {
                timer--;

                if (timerElement) {
                    timerElement.textContent =
                        timer;
                }

                if (timer <= 0) {
                    stopTimer();

                    autoPick();
                }
            }, 1000);
    }


    /* =========================
       타이머 정지
    ========================= */

    function stopTimer() {
        if (timerInterval) {
            clearInterval(
                timerInterval
            );

            timerInterval = null;
        }
    }


    /* =========================
       Draft UI
    ========================= */

    function updateDraftUI() {
        const action =
            getCurrentAction();

        if (!action) {
            return;
        }

        const phaseElements =
            document.querySelectorAll(
                "[data-draft-phase]"
            );

        phaseElements.forEach(
            function (element) {
                element.classList.remove(
                    "active"
                );
            }
        );

        const current =
            document.querySelector(
                `[data-draft-phase="${gameState.currentAction}"]`
            );

        if (current) {
            current.classList.add(
                "active"
            );
        }

        const actionText =
            document.getElementById(
                "currentAction"
            );

        if (actionText) {
            const teamName =
                action.team === "blue"
                    ? seriesState.blueTeam
                    : seriesState.redTeam;

            let typeText = "선택";

            if (
                action.type === "ban" ||
                action.type === "ban2"
            ) {
                typeText = "밴";
            }

            actionText.textContent =
                `${teamName} ${typeText}`;
        }
    }


    /* =========================
       Undo
    ========================= */

    if (undoButton) {
        undoButton.addEventListener(
            "click",
            function () {
                undoLastAction();
            }
        );
    }


    function undoLastAction() {
        if (history.length === 0) {
            return;
        }

        stopTimer();

        const last =
            history.pop();

        const team =
            last.team;

        if (
            last.actionType === "ban" ||
            last.actionType === "ban2"
        ) {
            gameState.bans[
                team
            ].pop();
        } else {
            gameState.picks[
                team
            ].pop();
        }

        gameState.currentAction =
            last.actionIndex;

        selectedChampion = null;

        updateLockPreview();

        renderChampionGrid();

        updateDraftUI();

        startTimer();
    }


    /* =========================
       Reset
    ========================= */

    if (resetButton) {
        resetButton.addEventListener(
            "click",
            function () {
                if (
                    !confirm(
                        "현재 게임의 드래프트를 초기화할까요?"
                    )
                ) {
                    return;
                }

                resetGame();
            }
        );
    }


    function resetGame() {
        stopTimer();

        gameState = {
            bans: {
                blue: [],
                red: []
            },

            picks: {
                blue: [],
                red: []
            },

            currentAction: 0
        };

        history = [];

        selectedChampion = null;

        updateLockPreview();

        renderChampionGrid();

        updateDraftUI();

        startTimer();
    }


    /* =========================
       Draft 시작
    ========================= */

    if (startDraftButton) {
        startDraftButton.addEventListener(
            "click",
            async function () {
                const blueTeam =
                    blueTeamInput?.value.trim() ||
                    "BLUE";

                const redTeam =
                    redTeamInput?.value.trim() ||
                    "RED";

                blueLogo =
                    blueLogoInput?.value.trim() ||
                    "";

                redLogo =
                    redLogoInput?.value.trim() ||
                    "";

                seriesState = {
                    blueTeam: blueTeam,
                    redTeam: redTeam,

                    blueLogo: blueLogo,
                    redLogo: redLogo,

                    bestOf: selectedSeries,

                    fearless:
                        fearlessEnabled,

                    timerEnabled:
                        timerEnabled,

                    currentGame: 1,

                    games: [],

                    previousPickedIds: []
                };

                resetGame();

                setupScreen.classList.add(
                    "hidden"
                );

                finalScreen.classList.add(
                    "hidden"
                );

                draftScreen.classList.remove(
                    "hidden"
                );

                if (
                    champions.length === 0
                ) {
                    await loadChampions();
                }

                createLaneFilter();

                renderChampionGrid();

                updateDraftUI();

                startTimer();
            }
        );
    }


    /* =========================
       게임 종료
    ========================= */

    function finishGame() {
        stopTimer();

        const gameResult = {
            game:
                seriesState.currentGame,

            bans: {
                blue: [
                    ...gameState.bans.blue
                ],

                red: [
                    ...gameState.bans.red
                ]
            },

            picks: {
                blue: [
                    ...gameState.picks.blue
                ],

                red: [
                    ...gameState.picks.red
                ]
            }
        };

        seriesState.games.push(
            gameResult
        );

        if (fearlessEnabled) {
            const newPickedIds =
                gameState.picks.blue
                    .concat(
                        gameState.picks.red
                    )
                    .map(function (champion) {
                        return String(
                            champion.id
                        );
                    });

            seriesState.previousPickedIds =
                seriesState.previousPickedIds.concat(
                    newPickedIds
                );
        }

        showFinalScreen();
    }


    /* =========================
       최종 화면
    ========================= */

    function showFinalScreen() {
        draftScreen.classList.add(
            "hidden"
        );

        finalScreen.classList.remove(
            "hidden"
        );

        if (finalBlueTeam) {
            finalBlueTeam.textContent =
                seriesState.blueTeam;
        }

        if (finalRedTeam) {
            finalRedTeam.textContent =
                seriesState.redTeam;
        }

        if (finalBlueLogo) {
            finalBlueLogo.src =
                seriesState.blueLogo || "";
        }

        if (finalRedLogo) {
            finalRedLogo.src =
                seriesState.redLogo || "";
        }

        renderFinalChampions(
            finalBluePicks,
            gameState.picks.blue
        );

        renderFinalChampions(
            finalRedPicks,
            gameState.picks.red
        );

        renderFinalChampions(
            finalBlueBans,
            gameState.bans.blue
        );

        renderFinalChampions(
            finalRedBans,
            gameState.bans.red
        );

        updateNextGameButton();
    }


    /* =========================
       최종 챔피언 출력
    ========================= */

    function renderFinalChampions(
        container,
        list
    ) {
        if (!container) {
            return;
        }

        container.innerHTML = "";

        list.forEach(function (champion) {
            const item =
                document.createElement("div");

            item.className =
                "final-champion";

            const image =
                document.createElement("img");

            image.src =
                getChampionImage(
                    champion
                );

            image.alt =
                champion.name;

            const name =
                document.createElement("span");

            name.textContent =
                champion.name;

            item.appendChild(image);
            item.appendChild(name);

            container.appendChild(item);
        });
    }


    /* =========================
       다음 게임 버튼
    ========================= */

    function updateNextGameButton() {
        if (!nextGameButton) {
            return;
        }

        if (
            seriesState.currentGame <
            seriesState.bestOf
        ) {
            nextGameButton.textContent =
                `다음 게임 (${seriesState.currentGame + 1} / ${seriesState.bestOf})`;

            nextGameButton.disabled =
                false;
        } else {
            nextGameButton.textContent =
                "시리즈 종료";

            nextGameButton.disabled =
                false;
        }
    }


    if (nextGameButton) {
        nextGameButton.addEventListener(
            "click",
            function () {
                if (
                    seriesState.currentGame >=
                    seriesState.bestOf
                ) {
                    finishSeries();
                    return;
                }

                startNextGame();
            }
        );
    }


    /* =========================
       다음 게임 시작
    ========================= */

    function startNextGame() {
        seriesState.currentGame++;

        gameState = {
            bans: {
                blue: [],
                red: []
            },

            picks: {
                blue: [],
                red: []
            },

            currentAction: 0
        };

        history = [];

        selectedChampion = null;

        finalScreen.classList.add(
            "hidden"
        );

        draftScreen.classList.remove(
            "hidden"
        );

        updateLockPreview();

        renderChampionGrid();

        updateDraftUI();

        startTimer();
    }


    /* =========================
       시리즈 종료
    ========================= */

    function finishSeries() {
        stopTimer();

        saveCurrentResult();

        alert(
            `${seriesState.bestOf}전 ${Math.ceil(
                seriesState.bestOf / 2
            )}선 시리즈가 종료되었습니다.`
        );

        finalScreen.classList.remove(
            "hidden"
        );
    }


    /* =========================
       결과 저장
    ========================= */

    const STORAGE_KEY =
        "lolDraftSavedResults";


    function getSavedResults() {
        try {
            return JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                ) || "[]"
            );
        } catch (error) {
            return [];
        }
    }


    function saveCurrentResult() {
        const results =
            getSavedResults();

        const saved = {
            id:
                Date.now(),

            createdAt:
                new Date().toISOString(),

            blueTeam:
                seriesState.blueTeam,

            redTeam:
                seriesState.redTeam,

            blueLogo:
                seriesState.blueLogo,

            redLogo:
                seriesState.redLogo,

            bestOf:
                seriesState.bestOf,

            fearless:
                seriesState.fearless,

            timerEnabled:
                seriesState.timerEnabled,

            games:
                seriesState.games.map(
                    function (game) {
                        return {
                            game:
                                game.game,

                            bans: {
                                blue:
                                    game.bans.blue.map(
                                        serializeChampion
                                    ),

                                red:
                                    game.bans.red.map(
                                        serializeChampion
                                    )
                            },

                            picks: {
                                blue:
                                    game.picks.blue.map(
                                        serializeChampion
                                    ),

                                red:
                                    game.picks.red.map(
                                        serializeChampion
                                    )
                            }
                        };
                    }
                )
        };

        results.unshift(saved);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(results)
        );

        renderSavedResults();
    }


    function serializeChampion(
        champion
    ) {
        return {
            id:
                champion.id,

            name:
                champion.name,

            image:
                champion.image
                ? champion.image.full
                : ""
        };
    }


    /* =========================
       저장 버튼
    ========================= */

    if (saveResultButton) {
        saveResultButton.addEventListener(
            "click",
            function () {
                saveCurrentResult();

                alert(
                    "현재 결과를 저장했습니다."
                );
            }
        );
    }


    /* =========================
       저장 결과 UI
    ========================= */

    function renderSavedResults() {
        let container =
            document.getElementById(
                "savedResults"
            );

        if (!container) {
            createSavedResultsContainer();

            container =
                document.getElementById(
                    "savedResults"
                );
        }

        if (!container) {
            return;
        }

        container.innerHTML = "";

        const results =
            getSavedResults();

        if (results.length === 0) {
            container.innerHTML =
                '<div class="no-saved-result">저장된 결과가 없습니다.</div>';

            return;
        }

        results.forEach(function (result) {
            const item =
                document.createElement("div");

            item.className =
                "saved-result-item";

            const title =
                document.createElement("div");

            title.className =
                "saved-result-title";

            title.textContent =
                `${result.blueTeam} vs ${result.redTeam}`;

            const info =
                document.createElement("div");

            info.className =
                "saved-result-info";

            const date =
                new Date(
                    result.createdAt
                );

            info.textContent =
                `${result.bestOf}전 ${result.fearless ? "피어리스" : "일반"} · ${date.toLocaleString("ko-KR")}`;

            const viewButton =
                document.createElement("button");

            viewButton.type =
                "button";

            viewButton.textContent =
                "보기";

            viewButton.addEventListener(
                "click",
                function () {
                    viewSavedResult(
                        result.id
                    );
                }
            );

            const deleteButton =
                document.createElement("button");

            deleteButton.type =
                "button";

            deleteButton.textContent =
                "삭제";

            deleteButton.addEventListener(
                "click",
                function () {
                    deleteSavedResult(
                        result.id
                    );
                }
            );

            item.appendChild(title);
            item.appendChild(info);
            item.appendChild(viewButton);
            item.appendChild(deleteButton);

            container.appendChild(item);
        });
    }


    function createSavedResultsContainer() {
        if (!setupScreen) {
            return;
        }

        const wrapper =
            document.createElement("section");

        wrapper.id =
            "savedResultsSection";

        const title =
            document.createElement("h2");

        title.textContent =
            "저장된 드래프트";

        const container =
            document.createElement("div");

        container.id =
            "savedResults";

        wrapper.appendChild(title);
        wrapper.appendChild(container);

        setupScreen.appendChild(wrapper);
    }


    /* =========================
       저장 결과 보기
    ========================= */

    function viewSavedResult(id) {
        const results =
            getSavedResults();

        const result =
            results.find(
                function (item) {
                    return item.id === id;
                }
            );

        if (!result) {
            return;
        }

        alert(
            `${result.blueTeam} vs ${result.redTeam}\n` +
            `${result.bestOf}전\n` +
            `${result.fearless ? "피어리스" : "일반"}\n\n` +
            result.games
                .map(function (game) {
                    return (
                        `Game ${game.game}\n` +
                        `Blue Pick: ${game.picks.blue.map(c => c.name).join(", ")}\n` +
                        `Red Pick: ${game.picks.red.map(c => c.name).join(", ")}`
                    );
                })
                .join("\n\n")
        );
    }


    /* =========================
       저장 결과 삭제
    ========================= */

    function deleteSavedResult(id) {
        if (
            !confirm(
                "이 저장 결과를 삭제할까요?"
            )
        ) {
            return;
        }

        const results =
            getSavedResults().filter(
                function (result) {
                    return result.id !== id;
                }
            );

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(results)
        );

        renderSavedResults();
    }


    /* =========================
       CSS 동적 추가
    ========================= */

    const dynamicStyle =
        document.createElement("style");

    dynamicStyle.textContent = `

        .champion-grid {
            max-height: 520px;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .champion-grid::-webkit-scrollbar {
            width: 8px;
        }

        .champion-grid::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,.2);
            border-radius: 10px;
        }

        .champion-item.unavailable {
            opacity: .2;
            filter: grayscale(1);
            cursor: not-allowed;
        }

        .lane-filter {
            display: flex;
            gap: 6px;
            margin: 12px 0;
            flex-wrap: wrap;
        }

        .lane-button {
            padding: 7px 12px;
            border: 1px solid rgba(255,255,255,.12);
            background: rgba(255,255,255,.04);
            color: #9ba5b5;
            border-radius: 6px;
            cursor: pointer;
        }

        .lane-button.active {
            color: white;
            border-color: #c89b3c;
            background: rgba(200,155,60,.14);
        }

        .timer-setting {
            margin: 15px 0;
        }

        .setting-title {
            font-size: 12px;
            margin-bottom: 8px;
            opacity: .7;
        }

        .timer-options {
            display: flex;
            gap: 8px;
        }

        .timer-option {
            padding: 9px 14px;
            border: 1px solid rgba(255,255,255,.12);
            background: rgba(255,255,255,.04);
            color: #9ba5b5;
            border-radius: 6px;
            cursor: pointer;
        }

        .timer-option.active {
            color: white;
            border-color: #c89b3c;
            background: rgba(200,155,60,.14);
        }

        .final-champion {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }

        .final-champion img {
            width: 48px;
            height: 48px;
            object-fit: cover;
        }

        .final-champion span {
            font-size: 11px;
        }

        #savedResultsSection {
            margin-top: 30px;
        }

        .saved-result-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px;
            margin-bottom: 8px;
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 8px;
        }

        .saved-result-title {
            font-weight: 600;
        }

        .saved-result-info {
            flex: 1;
            font-size: 12px;
            opacity: .65;
        }

        .saved-result-item button {
            padding: 6px 10px;
            cursor: pointer;
        }

        .no-saved-result {
            opacity: .5;
            padding: 15px 0;
        }

    `;

    document.head.appendChild(
        dynamicStyle
    );


    /* =========================
       초기 데이터 로드
    ========================= */

    createLaneFilter();

    renderSavedResults();

    loadChampions();
});