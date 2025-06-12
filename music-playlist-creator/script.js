document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".playlist-cards"); //playlist container
  const modal = document.getElementById("playlist-modal");
  const closeBtn = modal.querySelector(".close-button");
  const modalTitle = document.getElementById("modal-title");
  const modalCover = document.getElementById("modal-cover");
  const modalAuthor = document.getElementById("modal-author");
  const modalSongs = document.getElementById("modal-songs");
  const shuffleButton = document.getElementById("shuffle-button");

  fetch("data.json") //sends request to fetch the data file
    .then((response) => {
      if (!response.ok) {
        //checks if response was not succesful
        throw new Error("Network error: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      data.playlists.forEach(createPlaylistTile); //array playlists in data file - for each playlist it calls createPlaylistTitle
    })
    .catch((err) => {
      console.error("Failed to load playlists:", err);
    });

  function createPlaylistTile(pl) {
    //pl as the parameter
    const tile = document.createElement("div"); //creates tile as a new div element
    tile.className = "playlist-tile";
    tile.innerHTML = `
        <img src="${pl.playlist_cover}" alt="${pl.playlist_title}">
        <h3>${pl.playlist_title}</h3>
        <p>By ${pl.playlist_creator}</p>
        <div class = "likes">
        <span class="heart-icon">&#x2665;</span>
        <span class="like-count">${pl.likes}</span>
        </div>
      `;

    tile.addEventListener("click", (e) => {
      //click event listener to the tile element
      if (!e.target.classList.contains("heart-icon")) {
        //checks if the item was clicked but does not open if they click on the heart icon
        openModal(pl); //opens and shows more details
      }
    });

    const heart = tile.querySelector(".heart-icon"); //assigns the element in the current tile and assigns it to variable heart
    const count = tile.querySelector(".like-count"); //assigns the element in the current tile and assigns it to the variable count
    heart.addEventListener("click", (e) => {
      //adds click event listener to the heart icon d
      e.stopPropagation(); //prevents the click from triggering another click event
      let n = parseInt(count.textContent, 10); //string to integer
      if (heart.classList.contains("liked")) {
        //user already like the playlist
        heart.classList.remove("liked");
        count.textContent = --n;
      } else {
        //playlist not liked
        heart.classList.add("liked");
        count.textContent = ++n;
      }
    });
    container.appendChild(tile);
  }

  let currentSongs = []; //creates an array to store teh current order

  function openModal(pl) {
    modalCover.src = pl.playlist_cover; //sets teh playlist image to the modals cover image
    modalTitle.textContent = pl.playlist_title;
    modalAuthor.textContent = "By " + pl.playlist_creator;
    currentSongs = pl.songs || []; // in case songs is undefined
    mixSongs(currentSongs); //calls the function mix songs
    modal.classList.add("show"); //shows the modal
  }
  function mixSongs(songArray) {
    modalSongs.innerHTML = ""; //clears any songs from the modal's song list
    if (songArray.length === 0) {
      //checks if it is empty
      const li = document.createElement("li"); //creates a new list element item
      li.textContent = "No songs listed.";
      modalSongs.appendChild(li); //adds the list item to the modal's song list
    } else {
      //if there are songs in teh array
      songArray.forEach((s) => {
        //loops through each song
        const li = document.createElement("li"); //creates a new list item for each song
        li.innerHTML = `
        <img class="song-cover" src="${s.song_cover}" alt="Song Cover"
             style="width:70px;height:70px;vertical-align:middle;margin-right:8px;border-radius:4px;">
        <span class="song-info">${s.title} — ${s.artist} (${s.duration})</span>
      `;

        li.addEventListener("click", () => {
          //adds a click event listener to each song
          const songInfo = li.querySelector(".song-info");
          const songCover = li.querySelector(".song-cover");
          const existingIframe = li.querySelector(".spotify-embed"); //finds each
          if (existingIframe) {
            //checks if they alr have teh spotify emebed
            existingIframe.remove();
            songInfo.classList.remove("hidden"); //if ti does it removes the embed and shows the song info and cover again by removing the hidden class.
            songCover.classList.remove("hidden");
          } else if (s.spotify_url) {
            //if it doesnt then it hides the song info and shows the spotify embeded song
            songInfo.classList.add("hidden");
            songCover.classList.add("hidden");
            const wrapper = document.createElement("div");
            wrapper.className = "spotify-embed";
            wrapper.innerHTML = `
            <iframe 
              src="${s.spotify_url}" 
              width="100%" 
              height="80" 
              frameborder="0" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy" 
              style="border-radius: 12px;"></iframe>
          `;
            li.appendChild(wrapper);
          }
        });

        modalSongs.appendChild(li);
      });
    }
  }
  shuffleButton.addEventListener("click", () => {
    //click on shuffle button
    if (!currentSongs || currentSongs.length === 0) return; //edge case in case it is empty
    const shuffled = [...currentSongs].sort(() => Math.random() - 0.5);
    mixSongs(shuffled);
  });

  closeBtn.addEventListener("click", () => {
    //click button to exit the modal
    modal.classList.remove("show");
  });
  modal.addEventListener("click", (e) => {
    //same with the backgrounfd - exit if you click on it
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  });

  // Featured Page
  if (window.location.pathname.includes("featured.html")) { 
    fetch("data.json") //same as above for the index/ all page 
      .then((response) => {
        if (!response.ok) throw new Error("Network error: " + response.status);
        return response.json();
      })
      .then((data) => {
        randomPlaylist(data.playlists);
      })
      .catch((err) => {
        console.error("Failed to load playlists:", err);
      });

    function randomPlaylist(playlists) {
      const randomIndex = Math.floor(Math.random() * playlists.length); //picks a random index num and stores it in an array 
      const pl = playlists[randomIndex];


      container.innerHTML = ""; //clears container 

      const tile = document.createElement("div"); //Creates a new div for the playlist card, sets its class, and fills it with the playlist cover, title, and creator.
      tile.className = "playlist-tile";
      tile.innerHTML = `
    <img src="${pl.playlist_cover}" alt="${pl.playlist_title}">
    <h3>${pl.playlist_title}</h3>
    <p>By ${pl.playlist_creator}</p>
  `;
      container.appendChild(tile); //Adds this card to the container.


      // Show the song list below the card
      const songList = document.createElement("ul");
      pl.songs.forEach((s) => {
        const li = document.createElement("li");
        li.innerHTML = `
      <img class="song-cover" src="${s.song_cover}" alt="Song Cover" style="width:50px;height:50px;vertical-align:middle;margin-right:8px;border-radius:4px;">
      <span class="song-info">${s.title} — ${s.artist} (${s.duration})</span>
    `;

        // Add click event to show/hide Spotify embed //same thing as above 
        li.addEventListener("click", () => {
          const songInfo = li.querySelector(".song-info");
          const songCover = li.querySelector(".song-cover");
          const existingIframe = li.querySelector(".spotify-embed");
          if (existingIframe) {
            existingIframe.remove();
            songInfo.classList.remove("hidden");
            songCover.classList.remove("hidden");
          } else if (s.spotify_url) {
            songInfo.classList.add("hidden");
            songCover.classList.add("hidden");
            const wrapper = document.createElement("div");
            wrapper.className = "spotify-embed";
            wrapper.innerHTML = `
          <iframe 
            src="${s.spotify_url}" 
            width="100%" 
            height="80" 
            frameborder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy" 
            style="border-radius: 12px;"></iframe>
        `;
            li.appendChild(wrapper);
          }
        });

        songList.appendChild(li);
      });
      container.appendChild(songList);
    }
  }
});
