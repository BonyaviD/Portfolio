<script setup>
import SectionTitle from "@/components/shared/TheSectionTitle.vue";
import ProfileSrc from "@/assets/img/me.jpg";
import BulletText from "@/components/shared/BulletText.vue";
import Baloon from "@/assets/icons/Baloon.svg";
</script>
<template>
  <div class="container">
    <SectionTitle text="About Me" marginTop="9.375rem" marginBottom="10rem" />
    <div class="aboutme">
      <div class="profile-section">
        <img class="profile-pic" :src="ProfileSrc" alt="" />
        <div class="profile-circle"></div>
        <img class="baloon" :src="Baloon" alt="" />
      </div>

      <div class="aboutme-content">
        <div class="aboutme-content-name">Navid Bonyadi</div>
        <BulletText>Front-end developer with strong teamwork skills and expertise in building responsive, user-friendly websites.</BulletText>
        <BulletText>Passionate front-end developer with +2 years of experience building responsive and interactive websites.</BulletText>
        <BulletText>Strong understanding of UI/UX design principles, ensuring seamless user experiences across devices.</BulletText>
        <BulletText>Experienced in collaborating with cross-functional teams to deliver high-quality, scalable applications.</BulletText>
        <BulletText>Constantly learning new technologies and staying updated with the latest web development trends.</BulletText>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aboutme {
  display: flex;
  margin-top: 6.25rem;
  gap: 1.25rem 9.375rem;
}

.profile-section {
  position: relative;
}

.profile-pic {
  width: 25rem;
  border-radius: 30px;
  object-fit: cover;
  object-position: bottom;
}

.profile-circle {
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  width: 3rem;
  height: 3rem;
  background-color: var(--dark-background-color);
  border-radius: 100%;
}

.baloon {
  position: absolute;
  left: -2.5rem;
  top: -13rem;
  transform: rotate(50deg);
  animation: turnBaloon 2s alternate-reverse infinite;
}

@keyframes turnBaloon {
  from {transform: rotate(44deg);}
  to {transform: rotate(55deg);}
}

.aboutme-content-name {
  font-size: 2.5rem;
  font-weight: 400;
  margin-bottom: 4.063rem;
}

@media (max-width: 67.5rem) {
  .aboutme {
    gap: 1.25rem 3.125rem;
  }
}

@media (max-width: 60rem) {
  .aboutme {
    display: flex;
    flex-wrap: wrap;
    
  }
  .profile-pic {
    width: 100%;
  }
  .aboutme-content {
    width: 100%;
  }
}
</style>
