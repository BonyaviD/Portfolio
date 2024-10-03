<script setup>
import TheBotton from "~/components/shared/TheBotton.vue";
import SectionTitle from "@/components/shared/TheSectionTitle.vue";
import BulletText from "@/components/shared/BulletText.vue";
import TehranPeople from "@/assets/img/photography/tehran-people.jpg";
import Flower from "@/assets/img/photography/flower.jpg";
import Street from "@/assets/img/photography/street.jpg";
import MiladTower from "@/assets/img/photography/tehran-milad.jpg";
import AstaraSnow from "@/assets/img/photography/astara-snow.jpg";
import Airplane from "@/assets/img/photography/airplane.jpg";
import Hormuz from "@/assets/img/photography/hormoz.jpg";
import TelegramLogo from "@/assets/icons/Telegram.svg";
import Vsco from "@/assets/icons/Vsco.svg";
</script>

<template>
  <div>
    <div class="hobbies-title">
      <div>Photography</div>
      <BulletText>I really enjoy photography and find great satisfaction in capturing unique moments through my lens.</BulletText>
    </div>
    <div class="photography">
      <div class="picture tehran-people">
        <img :src="TehranPeople" alt="People in Tehran at Night" />
        <div class="picture-note center-note">People</div>
        <div class="picture-note down-note">Tehran</div>
      </div>
      <div class="picture flower">
        <img :src="Flower" alt="" />
        <div class="picture-note center-note">Flower</div>
        <div class="picture-note down-note">Astara</div>
      </div>
      <div class="picture street">
        <img :src="Street" alt="" />
        <div class="picture-note center-note">Street</div>
        <div class="picture-note down-note">Astara</div>
      </div>
      <div class="picture milad-tower">
        <img :src="MiladTower" alt="" />
        <div class="picture-note center-note">Tower</div>
        <div class="picture-note down-note">Tehran</div>
      </div>
      <div class="picture airplane">
        <img :src="Airplane" alt="" />
        <div class="picture-note center-note">Airplane</div>
        <div class="picture-note down-note">Tehran</div>
      </div>
      <div class="picture astara-snow">
        <img :src="AstaraSnow" alt="" />
        <div class="picture-note center-note">Snow</div>
        <div class="picture-note down-note">Astara</div>
      </div>
      <div class="picture hormuz">
        <img :src="Hormuz" alt="" />
        <div class="picture-note center-note">Mountain</div>
        <div class="picture-note down-note">Hormuz</div>
      </div>
      <div class="vsco-icon"><img :src="Vsco" alt="" /></div>
      <div class="sub-btn"><TheBotton to="https://t.me/StreetNote" text="For More" :Logo="TelegramLogo" opacityMode="" /></div>
    </div>
  </div>
</template>

<style scoped>
.hobbies-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 1.5rem;
  color: white;
  gap: 10px 40px;
  margin-bottom: 60px;
}

.photography {
  display: grid;
  grid-auto-columns: minmax(60px, auto);
  grid-auto-rows: minmax(10px, auto);
  gap: 30px;
  margin-bottom: 60px;
}
.picture {
  position: relative;
  border: 2px solid var(--primary-color);
  border-radius: 6px;
  overflow: hidden;
}
.picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 1s ease-in-out;
}
.picture:hover img {
  filter: blur(2px) grayscale(100%);
  transform: scale(1.5);
  transition: all 1s ease-in-out;
}

.picture .picture-note {
  position: absolute;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: all 1s ease-in;
  
}
.picture .center-note {
  font-size: 2rem;
  background-color: var(--second-dark-color);
  font-weight: 800;
  color: var(--primary-color);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  top: 50%;
  left: 50%;
}

.picture .down-note {
  padding: 0.1rem 0.5rem;
  border-radius: 18px;
  backdrop-filter: blur(2px);
  background-color: var(--primary-color);
  color: var(--primary-dark-color);
  font-size: 1.2rem;
  font-weight: 600;
  top: 85%;
  left: 50%;
}

.picture:hover .picture-note {
  opacity: 1;
}
.tehran-people {
  grid-column: 1/4;
  grid-row: 1/2;
}
.flower {
  grid-column: 4/6;
  grid-row: 1/4;
}
.street {
  grid-column: 6/9;
  grid-row: 1/2;
}
.milad-tower {
  grid-column: 9/12;
  grid-row: 1/8;
}
.airplane {
  grid-column: 1/4;
  grid-row: 2/6;
}
.astara-snow {
  grid-column: 4/7;
  grid-row: 4/8;
}
.hormuz {
  grid-column: 7/9;
  grid-row: 2/8;
}
.vsco-icon {
  grid-column: 6/7;
  grid-row: 2/4;
}
.sub-btn {
  grid-column: 1/4;
  grid-row: 6/8;
}
.sub-btn a {
  width: 100%;
  height: 100%;
  font-size: 1rem;
  font-weight: 600;
}

@media (max-width: 1080px) {
  .photography {
    grid-auto-columns: minmax(10px, auto);
    grid-auto-rows: minmax(10px, auto);
    gap: 10px;
  }
}

@media (max-width: 920px) {
  .tehran-people {
    grid-column: 1/8;
    grid-row: 1/2;
  }
  .flower {
    grid-column: 1/8;
    grid-row: 2/6;
  }
  .street {
    grid-column: 6/12;
    grid-row: 8/10;
  }
  .milad-tower {
    grid-column: 8/12;
    grid-row: 1/8;
  }
  .airplane {
    grid-column: 1/6;
    grid-row: 6/10;
  }
  .astara-snow {
    grid-column: 7/11;
    grid-row: 10/14;
  }
  .hormuz {
    grid-column: 2/7;
    grid-row: 10/14;
  }
  .vsco-icon {
    grid-column: 6/8;
    grid-row: 6/8;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .vsco-icon img {
    width: 80%;
  }
  .sub-btn {
    grid-column: 4/9;
    grid-row: 16/20;
  }
}
</style>
