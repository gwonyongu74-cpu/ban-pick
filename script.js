```javascript
const championList = document.getElementById("championList");
const search = document.getElementById("search");

const blueBans = document.getElementById("blueBans");
const redBans = document.getElementById("redBans");

const bluePicks = document.getElementById("bluePicks");
const redPicks = document.getElementById("redPicks");

const phaseText = document.getElementById("phase");
const turnText = document.getElementById("turn");

const undoButton = document.getElementById("undo");
const resetButton = document.getElementById("reset");

let champions = [];

let state = {
    phase: "ban",

    blueBans: [],
    redBans: [],

    bluePicks: [],
    redPicks: [],

    turn: "blue"
};

let history = [];


/*
    Riot Data Dragon에서 챔피언 목록 가져오기
*/

async function loadChampions() {

    try {

        const versionResponse =
            await fetch(
                "https://ddragon.leagueoflegends.com/api/versions.json"
            );

        const versions = await versionResponse.json();

        const latestVersion = versions[0];

        const response =
            await fetch(
                `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/ko_KR/champion.json`
            );

        const data = await response.json();

        champions = Object.values(data.data);

        renderChampions();

    } catch (error) {

        console.error("챔피언 데이터를 불러오지 못했습니다.", error);

        championList.innerHTML =
            "<p>챔피언 데이터를 불러오지 못했습니다.</p>";
    }
}


/*
    챔피언 목록 출력
*/

function renderChampions() {

    const keyword =
        search.value.toLowerCase();

    championList.innerHTML = "";

    champions
        .filter(champion =>
            champion.name.toLowerCase().includes(keyword)
        )
        .forEach(champion => {

            const element =
                document.createElement("div");

            element.className = "champion";

            if (isSelected(champion.id)) {
                element.classList.add("disabled");
            }

            element.innerHTML = `
                <img
                    src="${getChampionImage(champion)}"
                    alt="${champion.name}"
                >

                <div class="champion-name">
                    ${champion.name}
                </div>
            `;

            element.addEventListener(
                "click",
                () => selectChampion(champion)
            );

            championList.appendChild(element);
        });
}


/*
    챔피언 이미지
*/

function getChampionImage(champion) {

    return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`;
}


/*
    이미 선택된 챔피언인지 확인
*/

function isSelected(id) {

    return (
        state.blueBans.some(c => c.id === id) ||
        state.redBans.some(c => c.id === id) ||
        state.bluePicks.some(c => c.id === id) ||
        state.redPicks.some(c => c.id === id)
    );
}


/*
    챔피언 선택
*/

function selectChampion(champion) {

    saveHistory();

    if (state.phase === "ban") {

        if (state.turn === "blue") {

            state.blueBans.push(champion);
            state.turn = "red";

        } else {

            state.redBans.push(champion);
            state.turn = "blue";
        }

        checkBanPhase();

    } else {

        if (state.turn === "blue") {

            state.bluePicks.push(champion);
            state.turn = "red";

        } else {

            state.redPicks.push(champion);
            state.turn = "blue";
        }

        checkPickPhase();
    }

    render();
}


/*
    밴 페이즈 종료 확인
*/

function checkBanPhase() {

    const totalBans =
        state.blueBans.length +
        state.redBans.length;

    /*
        총 10밴
    */

    if (totalBans >= 10) {

        state.phase = "pick";
        state.turn = "blue";

    }
}


/*
    픽 페이즈 종료 확인
*/

function checkPickPhase() {

    const totalPicks =
        state.bluePicks.length +
        state.redPicks.length;

    /*
        총 10픽
    */

    if (totalPicks >= 10) {

        state.phase = "complete";

        turnText.textContent = "밴픽 완료";
    }
}


/*
    화면 갱신
*/

function render() {

    renderSlots(
        blueBans,
        state.blueBans
    );

    renderSlots(
        redBans,
        state.redBans
    );

    renderSlots(
        bluePicks,
        state.bluePicks
    );

    renderSlots(
        redPicks,
        state.redPicks
    );

    updateStatus();

    renderChampions();
}


/*
    슬롯 출력
*/

function renderSlots(container, list) {

    container.innerHTML = "";

    for (let i = 0; i < 5; i++) {

        const slot =
            document.createElement("div");

        slot.className = "slot";

        if (list[i]) {

            slot.innerHTML = `
                <img
                    src="${getChampionImage(list[i])}"
                    alt="${list[i].name}"
                >
            `;
        }

        container.appendChild(slot);
    }
}


/*
    현재 상태 표시
*/

function updateStatus() {

    if (state.phase === "ban") {

        phaseText.textContent = "밴 페이즈";

    } else if (state.phase === "pick") {

        phaseText.textContent = "픽 페이즈";

    } else {

        phaseText.textContent = "밴픽 완료";
    }


    if (state.phase === "complete") {

        turnText.textContent = "밴픽 완료";

    } else {

        turnText.textContent =
            state.turn === "blue"
                ? "블루팀 차례"
                : "레드팀 차례";
    }
}


/*
    상태 저장
*/

function saveHistory() {

    history.push(
        JSON.parse(JSON.stringify(state))
    );
}


/*
    이전 단계
*/

undoButton.addEventListener(
    "click",
    () => {

        if (history.length === 0) {
            return;
        }

        state =
            history.pop();

        render();
    }
);


/*
    초기화
*/

resetButton.addEventListener(
    "click",
    () => {

        state = {

            phase: "ban",

            blueBans: [],
            redBans: [],

            bluePicks: [],
            redPicks: [],

            turn: "blue"
        };

        history = [];

        render();
    }
);


/*
    검색
*/

search.addEventListener(
    "input",
    renderChampions
);


/*
    시작
*/

loadChampions();
render();
```
