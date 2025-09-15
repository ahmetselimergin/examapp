<script setup>
import LoginForm from '../components/auth/LoginForm.vue';
</script>
<template>
     <div class="login-container">
          <div class="login-left">
               <div class="form-title">
                    <span class="title">Hoşgeldiniz</span>
                    <span class="subtitle">Sınav Yapmanın Yeni Nesil Hali</span>
               </div>
               <div class="login-form">
                    <LoginForm />
               </div>
               
          </div>
          <div class="login-right">
               <img src="https://images.unsplash.com/photo-1672009190560-12e7bade8d09?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="login visual" />
          </div>
     </div>
</template>
<style lang="scss" scoped>
.form-title {
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: 1rem;
     margin-bottom: 2rem;

     .title {
          font-size: 2rem;
          font-weight: 700;
     }
     .subtitle {
          font-size: 1rem;
          font-weight: 400;
          color: #888;
     }
}
.login-container {
     display: grid;
     grid-template-columns: 2fr 3fr;
     min-height: 100vh;
     background: #f7f8fa;

     .login-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          margin-top: 15%;
          background: #f7f8fa;

          .login-form {
               width: 100%;
               max-width: 350px;
               background: transparent;
               padding: 40px 0;

               h2 {
                    font-weight: 700;
                    margin-bottom: 10px;

                    .brand {
                         color: #ff8800;
                    }
               }

               p {
                    color: #888;
                    font-size: 0.95em;
                    margin-bottom: 25px;
               }

               label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: #222;
               }

               input[type="email"],
               input[type="password"] {
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 18px;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    font-size: 1em;
                    background: #fff;
                    transition: border 0.2s;

                    &:focus {
                         border-color: #ff8800;
                         outline: none;
                    }
               }

               .login-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 18px;

                    .remember-me {
                         display: flex;
                         align-items: center;
                         font-size: 0.95em;

                         input[type="checkbox"] {
                              margin-right: 6px;
                              accent-color: #ff8800;
                         }
                    }

                    .forgot {
                         color: #888;
                         font-size: 0.95em;
                         text-decoration: none;

                         &:hover {
                              text-decoration: underline;
                         }
                    }
               }

               .login-btn {
                    width: 100%;
                    background: #ff8800;
                    color: #fff;
                    border: none;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 1.1em;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;

                    &:hover {
                         background: #ff9900;
                    }
               }
          }
     }

     .login-right {
          flex: 1;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;

          img {
               width: 100%;
               height: 100vh;
               object-fit: cover;
               object-position: center;
          }
     }
}

@media (max-width: 900px) {
     .login-container {
          display: flex;
          flex-direction: column;

          .login-right {
               display: none;
          }

          .login-left {
               width: 100%;
               min-height: 100vh;
          }
     }
}
</style>