```javascript
const championContainer =
    document.getElementById("champions");

const searchInput =
    document.getElementById("search");

const blueBans =
    document.getElementById("blueBans");

const redBans =
    document.getElementById("redBans");

const bluePlayers =
    document.getElementById("bluePlayers");

const redPlayers =
    document.getElementById("redPlayers");

const phaseText =
    document.getElementById("phase");

const timerText =
    document.getElementById("timer");

const turnTeamText =
    document.getElementById("turnTeam");

const turnActionText =
    document.getElementById("turnAction");

const messageText =
    document.getElementById("message");

const blueStatus =
    document.getElementById("blueStatus");

const redStatus =
    document.getElementById("redStatus");

const undoButton =
    document.getElementById("undo");

const resetButton =
    document.getElementById("reset");


/* =========================================
   챔피언 데이터
========================================= */

let champions = [];


/* =========================================
   게임 상태
========================================= */

let state = {

    currentStep: 0,

    blueBans: [],
    redBans: [],

    bluePicks: [],
    redPicks: [],

    completed: false
};


/* =========================================
   되돌리기
========================================= */

let history = [];


/* =========================================
   실제 Draft 순서
========================================= */

/*

    BAN 1

    B B
    R R
    B B
    R R
    B

    실제 순서는:

    Blue
    Red
    Blue
    Red
    Blue

    PICK 1

    Blue
    Red
    Red
    Blue
    Blue

    BAN 2

    Red
    Blue
    Red
    Blue
    Red

    PICK 2

    Red
    Blue
    Blue
    Red

*/

const draftOrder = [

    /* BAN PHASE 1 */

    {
        phase: "ban",
        team: "blue"
    },

    {
        phase: "ban",
        team: "red"
    },

    {
        phase: "ban",
        team: "blue"
    },

    {
        phase: "ban",
        team: "red"
    },

    {
        phase: "ban",
        team: "blue"
    },


    /* PICK PHASE 1 */

    {
        phase: "pick",
        team: "blue"
    },

    {
        phase: "pick",
        team: "red"
    },

    {
        phase: "pick",
        team: "red"
    },

    {
        phase: "pick",
        team: "blue"
    },

    {
        phase: "pick",
        team: "blue"
    },


    /* BAN PHASE 2 */

    {
        phase: "ban",
        team: "red"
    },

    {
        phase: "ban",
        team: "blue"
    },

    {
        phase: "ban",
        team: "red"
    },

    {
        phase: "ban",
        team: "blue"
    },

    {
        phase: "ban",
        team: "red"
    },


    /* PICK PHASE 2 */

    {
        phase: "pick",
        team: "red"
    },

    {
        phase: "pick",
        team: "blue"
    },

    {
        phase: "pick",
        team: "blue"
    },

    {
        phase: "pick",
        team: "red"
    }
];


/* =========================================
   타이머
========================================= */

let timer = 30;

let timerInterval = null;


/* =========================================
   챔피언 데이터 가져오기
========================================= */

async function loadChampions() {

    try {

        const versionsResponse =
            await fetch(
                "https://ddragon.leagueoflegends.com/api/versions.json"
            );

        const versions =
            await versionsResponse.json();

        const version =
            versions[0];


        const response =
            await fetch(
                `https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion.json`
            );

        const data =
            await response.json();


        champions =
            Object.values(data.data);


        renderChampions();


    } catch (error) {

        console.error(error);

        championContainer.innerHTML =
            `
            <div style="
                grid-column:1/-1;
                text-align:center;
                color:#777;
                padding:30px;
            ">
                챔피언 데이터를 불러오지 못했습니다.
            </div>
            `;
    }
}


/* =========================================
   챔피언 이미지
========================================= */

function championImage(champion) {

    return `
        https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg
    `;
}


/* =========================================
   선택된 챔피언 ID 가져오기
========================================= */

function getSelectedChampionIds() {

    const selected = [

        ...state.blueBans,
        ...state.redBans,
        ...state.bluePicks,
        ...state.redPicks

    ];

    return new Set(
        selected.map(champion => champion.id)
    );
}


/* =========================================
   챔피언 목록
========================================= */

function renderChampions() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    const selected =
        getSelectedChampionIds();


    championContainer.innerHTML = "";


    champions
        .filter(champion => {

            return champion.name
                .toLowerCase()
                .includes(keyword);

        })
        .forEach(champion => {

            const element =
                document.createElement("div");


            element.className =
                "champion";


            if (
                selected.has(champion.id)
            ) {

                element.classList.add(
                    "selected"
                );
            }


            element.innerHTML = `

                <div class="champion-image">

                    <img
                        src="${championImage(champion)}"
                        alt="${champion.name}"
                    >

                </div>

                <div class="champion-name">
                    ${champion.name}
                </div>

            `;


            if (
                !selected.has(champion.id)
            ) {

                element.addEventListener(
                    "click",
                    () => chooseChampion(champion)
                );
            }


            championContainer.appendChild(
                element
            );

        });
}


/* =========================================
   챔피언 선택
========================================= */

function chooseChampion(champion) {

    if (
        state.completed
    ) {
        return;
    }


    const current =
        draftOrder[state.currentStep];


    if (!current) {
        return;
    }


    /* 선택 전 상태 저장 */

    history.push(
        JSON.parse(
            JSON.stringify(state)
        )
    );


    if (
        current.phase === "ban"
    ) {

        if (
            current.team === "blue"
        ) {

            state.blueBans.push(
                champion
            );

        } else {

            state.redBans.push(
                champion
            );
        }


    } else {

        if (
            current.team === "blue"
        ) {

            state.bluePicks.push(
                champion
            );

        } else {

            state.redPicks.push(
                champion
            );
        }
    }


    state.currentStep++;


    if (
        state.currentStep >=
        draftOrder.length
    ) {

        state.completed = true;

        stopTimer();

    } else {

        startTimer();
    }


    render();
}


/* =========================================
   현재 Draft 정보
========================================= */

function getCurrentDraft() {

    if (
        state.completed
    ) {

        return null;
    }


    return draftOrder[
        state.currentStep
    ];
}


/* =========================================
   화면 갱신
========================================= */

function render() {

    renderBans();

    renderPlayers();

    renderChampions();

    renderStatus();

    renderTurn();

    renderTimer();
}


/* =========================================
   BAN 출력
========================================= */

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
            state.blueBans[i]
        );

        createBanSlot(
            redBans,
            state.redBans[i]
        );
    }
}


/* =========================================
   BAN 슬롯
========================================= */

function createBanSlot(
    container,
    champion
) {

    const slot =
        document.createElement("div");

    slot.className =
        "ban-slot";


    if (champion) {

        slot.innerHTML = `

            <img
                src="${championImage(champion)}"
                alt="${champion.name}"
            >

        `;
    }


    container.appendChild(slot);
}


/* =========================================
   PICK 플레이어
========================================= */

function renderPlayers() {

    bluePlayers.innerHTML = "";
    redPlayers.innerHTML = "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        createPlayerSlot(
            bluePlayers,
            state.bluePicks[i],
            i
        );

        createPlayerSlot(
            redPlayers,
            state.redPicks[i],
            i
        );
    }
}


/* =========================================
   PICK 슬롯
========================================= */

function createPlayerSlot(
    container,
    champion,
    index
) {

    const player =
        document.createElement("div");

    player.className =
        "player";


    const roles = [
        "TOP",
        "JUNGLE",
        "MID",
        "BOT",
        "SUPPORT"
    ];


    if (champion) {

        player.innerHTML = `

            <div class="player-image">

                <img
                    src="${championImage(champion)}"
                    alt="${champion.name}"
                >

            </div>

            <div class="player-info">

                <div class="player-role">
                    ${roles[index]}
                </div>

                <div class="player-name">
                    ${champion.name}
                </div>

            </div>
        `;

    } else {

        player.innerHTML = `

            <div class="player-image">
                <div class="empty-player">
                    ?
                </div>
            </div>

            <div class="player-info">

                <div class="player-role">
                    ${roles[index]}
                </div>

                <div class="player-name">
                    NOT SELECTED
                </div>

            </div>
        `;
    }


    container.appendChild(player);
}


/* =========================================
   상태 표시
========================================= */

function renderStatus() {

    if (
        state.completed
    ) {

        phaseText.textContent =
            "DRAFT COMPLETE";

        blueStatus.textContent =
            "COMPLETE";

        redStatus.textContent =
            "COMPLETE";

        messageText.textContent =
            "DRAFT COMPLETE";

        return;
    }


    const current =
        getCurrentDraft();


    if (
        current.phase === "ban"
    ) {

        const banCount =
            state.blueBans.length +
            state.redBans.length;


        if (
            banCount < 5
        ) {

            phaseText.textContent =
                "BAN PHASE 1";

        } else {

            phaseText.textContent =
                "BAN PHASE 2";
        }


    } else {

        phaseText.textContent =
            "PICK PHASE";
    }


    blueStatus.textContent =
        current.team === "blue"
            ? current.phase.toUpperCase()
            : "";

    redStatus.textContent =
        current.team === "red"
            ? current.phase.toUpperCase()
            : "";


    messageText.textContent =

        current.team === "blue"

            ? `BLUE SIDE ${current.phase.toUpperCase()}`

            : `RED SIDE ${current.phase.toUpperCase()}`;
}


/* =========================================
   현재 차례
========================================= */

function renderTurn() {

    if (
        state.completed
    ) {

        turnTeamText.textContent =
            "DRAFT";

        turnActionText.textContent =
            "COMPLETE";

        return;
    }


    const current =
        getCurrentDraft();


    turnTeamText.textContent =
        current.team === "blue"
            ? "BLUE"
            : "RED";


    turnActionText.textContent =
        current.phase.toUpperCase();


    turnTeamText.style.color =
        current.team === "blue"
            ? "#3da9ff"
            : "#ff5260";
}


/* =========================================
   타이머 표시
========================================= */

function renderTimer() {

    timerText.textContent =
        timer;
}


/* =========================================
   타이머 시작
========================================= */

function startTimer() {

    stopTimer();


    timer = 30;

    renderTimer();


    timerInterval =
        setInterval(() => {

            timer--;

            renderTimer();


            if (
                timer <= 0
            ) {

                stopTimer();

                autoSkip();

            }

        }, 1000);
}


/* =========================================
   타이머 종료
========================================= */

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


/* =========================================
   시간 초과
========================================= */

function autoSkip() {

    /*
        실제 게임 서버에서는
        시간 초과 시 자동 처리 규칙이
        적용될 수 있다.

        여기서는 테스트용으로
        다음 단계로 넘어간다.
    */

    if (
        state.completed
    ) {
        return;
    }


    history.push(
        JSON.parse(
            JSON.stringify(state)
        )
    );


    state.currentStep++;


    if (
        state.currentStep >=
        draftOrder.length
    ) {

        state.completed = true;

        stopTimer();

    } else {

        startTimer();
    }


    render();
}


/* =========================================
   UNDO
========================================= */

undoButton.addEventListener(
    "click",
    () => {

        if (
            history.length === 0
        ) {
            return;
        }


        stopTimer();


        state =
            history.pop();


        if (
            !state.completed
        ) {

            startTimer();
        }


        render();
    }
);


/* =========================================
   RESET
========================================= */

resetButton.addEventListener(
    "click",
    () => {

        stopTimer();


        state = {

            currentStep: 0,

            blueBans: [],
            redBans: [],

            bluePicks: [],
            redPicks: [],

            completed: false
        };


        history = [];


        searchInput.value = "";


        startTimer();

        render();
    }
);


/* =========================================
   검색
========================================= */

searchInput.addEventListener(
    "input",
    renderChampions
);


/* =========================================
   시작
========================================= */

loadChampions();

render();

startTimer();
```
