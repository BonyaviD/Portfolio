<script setup>
import SectionTitle from "@/components/shared/TheSectionTitle.vue";
import ProfileSrc from "@/assets/img/me.jpg";
import BulletText from "~/components/shared/BulletText.vue";
</script>
<template>
  <div class="container">
    <SectionTitle text="About Me" marginTop="150px" marginBottom="100px" />
    <div class="aboutme">
      <img class="profile-pic" :src="ProfileSrc" alt="" />
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
  margin-top: 100px;
  gap: 20px 150px;
}
.profile-pic {
  width: 400px;
  border-radius: 30px;
  object-fit: cover;
  object-position: bottom;
}

.aboutme-content-name {
  font-size: 40px;
  font-weight: 400;
  margin-bottom: 65px;
}

@media (max-width: 1080px) {
  .aboutme {
    gap: 20px 50px;
  }
}

@media (max-width: 960px) {
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
