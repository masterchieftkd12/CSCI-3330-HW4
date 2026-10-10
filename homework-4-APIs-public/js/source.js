function formatYearFromStr(dateString) {
  if (!dateString) return "";
  return dateString.split("-")[0];
}

function formatPercentage(value) {
  if (value === null || value === undefined) return "N/A";
  return `${(value * 100).toFixed(2)}%`;
}

localStorage.setItem("game_id", "41494");
localStorage.setItem("api_key", "ba9ef98992a241bea686ee8bd5525b58");

async function load() {
  const gameID = localStorage.getItem("game_id");
  const apiKey = localStorage.getItem("api_key");

  if (!gameID || !apiKey) return;

  try {
    const detailsResponse = await fetch(
      `https://api.gamebrain.co/v1/games/${gameID}?api-key=${apiKey}`
    );
    const game = await detailsResponse.json();

    const newsResponse = await fetch(
      `https://api.gamebrain.co/v1/games/${gameID}/news?api-key=${apiKey}`
    );
    const newsData = await newsResponse.json();

    const heroImage = document.querySelector(".game-hero .game-image img");
    const heroGenre = document.querySelector(".game-hero .game-genre");
    const heroTitle = document.querySelector("#game-name");
    const heroMeta = document.querySelector(".game-hero .game-meta");

    if (heroTitle) {
      heroTitle.textContent = game.name || game.title || "Cyberpunk 2077";
    }

    if (heroImage && (game.image || game.cover || game.artwork)) {
      heroImage.src = game.image || game.cover || game.artwork;
      heroImage.alt = `${heroTitle?.textContent || "Game"} artwork`;
    }

    if (heroGenre) {
      const genres = Array.isArray(game.genres)
        ? game.genres.map((g) => (typeof g === "object" ? g.name : g)).join(", ")
        : game.genre || "Role Playing";
      heroGenre.textContent = genres;
    }

    if (heroMeta) {
      const developer = Array.isArray(game.developers)
        ? game.developers[0]?.name || game.developers[0]
        : game.developer || "CD Projekt Red";

      const releaseDate = game.released || game.release_date || game.year || "";
      const formattedYear = formatYearFromStr(String(releaseDate));

      heroMeta.textContent = `${developer} • ${formattedYear}`;
    }

    const newsCards = document.querySelectorAll(".news-list .news-card");
    const newsItems = Array.isArray(newsData)
      ? newsData
      : newsData.results || newsData.news || [];

    newsCards.forEach((card, index) => {
      if (newsItems[index]) {
        const item = newsItems[index];
        const img = card.querySelector("img");
        const title = card.querySelector("h3");
        const published = card.querySelector(".news-published");

        if (img && (item.image || item.artwork || item.cover)) {
          img.src = item.image || item.artwork || item.cover;
        }
        if (title) {
          title.textContent = item.title || item.name || "";
        }
        if (published) {
          const dateStr = item.published || item.date || item.created_at || "";
          published.textContent = dateStr ? `Published ${dateStr}` : "";
        }
      }
    });

    const gameCards = document.querySelectorAll(".game-grid .game-card");
    const similarGames =
      game.similar_games || game.related_games || game.similar || [];

    gameCards.forEach((card, index) => {
      if (similarGames[index]) {
        const simGame = similarGames[index];
        const img = card.querySelector("img");
        const title = card.querySelector("h3");
        const spans = card.querySelectorAll(".game-card-meta span");

        if (title) {
          title.textContent = simGame.name || simGame.title || "";
        }

        if (img) {
          const screenshot =
            (Array.isArray(simGame.screenshots) && simGame.screenshots[0]) ||
            simGame.image ||
            simGame.cover ||
            simGame.screenshot;
          if (screenshot) {
            img.src = typeof screenshot === "object" ? screenshot.url : screenshot;
          }
        }

        if (spans.length >= 2) {
          const rawYear = simGame.year || simGame.released || simGame.release_date || 0;
          const parsedYear = parseInt(rawYear, 10);
          spans[0].textContent = Number.isNaN(parsedYear) ? "" : parsedYear;

          const rawRating =
            simGame.rating?.mean ??
            simGame.rating ??
            simGame.rating_mean ??
            0;

          const normalized =
            rawRating > 1 ? (rawRating > 10 ? rawRating / 100 : rawRating / 10) : rawRating;

          spans[1].textContent = formatPercentage(normalized);
        }
      }
    });
  } catch (error) {
    console.error("Error fetching GameBrain API data:", error);
  }
}

load();