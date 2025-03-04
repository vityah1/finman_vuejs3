<template>
	<div v-if="currentUser" class="container">
		<alert-component ref="myAlert"></alert-component>
		<header class="jumbotron">
			<h3>
				Профіль: <strong>{{ currentUser.login }}</strong> [{{ currentUser.id }}]
			</h3>
		</header>

		<!-- Секція інформації про групу -->
		<div class="card mb-4">
			<div class="card-header d-flex justify-content-between align-items-center">
				<h4 class="mb-0">Моя сімейна група</h4>
				<div v-if="!userGroup"><b-button variant="success" @click="showCreateGroupModal = true">
						<i class="fas fa-plus"></i> Створити групу
					</b-button>
				</div>
			</div>

			<div class="card-body">
				<!-- Якщо користувач у групі -->
				<div v-if="userGroup" class="group-info">
					<h5>{{ userGroup.name }}</h5>
					<p class="text-muted">{{ userGroup.description }}</p>

					<div class="d-flex align-items-center mb-3">
						<span class="badge bg-primary me-2">{{ isGroupOwner ? "Власник" : "Учасник" }}</span>
						<div v-if="isGroupOwner" class="ms-auto">
							<b-button size="sm" variant="outline-primary" @click="showEditGroupModal = true">
								<i class="fas fa-edit"></i> Редагувати
							</b-button>
						</div>
						<div v-else class="ms-auto">
							<b-button size="sm" variant="outline-danger" @click="confirmLeaveGroup">
								<i class="fas fa-sign-out-alt"></i> Вийти з групи
							</b-button>
						</div>
					</div>
				</div>

				<!-- Якщо користувач не у групі -->
				<div v-else class="text-center py-4">
					<p class="mb-3">Ви ще не є учасником жодної групи</p>
					<b-button variant="outline-primary" @click="showJoinGroupModal = true">
						Приєднатися до існуючої групи
					</b-button>
				</div>
			</div>
		</div>

		<!-- Секція учасників групи -->
		<div v-if="userGroup" class="card mb-4">
			<div class="card-header d-flex justify-content-between align-items-center">
				<h4 class="mb-0">Учасники групи</h4>
				<div v-if="isGroupOwner">
					<b-button variant="success" @click="showInviteModal = true">
						<i class="fas fa-user-plus"></i> Запросити
					</b-button>
				</div>
			</div>

			<div class="card-body">
				<div v-if="loadingGroupUsers" class="text-center py-4">
					<b-spinner variant="primary"></b-spinner>
					<p class="mt-2">Завантаження учасників...</p>
				</div>

				<div v-else-if="groupUsers.length === 0" class="text-center py-4">
					<p>У групі поки немає учасників</p>
				</div>

				<div v-else class="group-members">
					<div v-for="user in groupUsers" :key="user.id" :class="{ 'bg-light': user.id === currentUser.id }" class="user-card p-3 mb-2 border rounded d-flex align-items-center">
						<div class="avatar me-3">
							<i class="fas fa-user-circle fa-2x"></i>
						</div>
						<div class="flex-grow-1">
							<h5 class="mb-1">{{ user.fullname || user.login }}</h5>
							<div class="d-flex align-items-center">
                <span :class="getRoleBadgeClass(user)" class="badge">
                  {{ getFormattedRole(user) }}
                </span>
								<span v-if="user.relation_type" class="badge bg-info ms-2">
                  {{ user.relation_type }}
                </span>
							</div>
						</div>
						<div v-if="isGroupOwner && user.id !== currentUser.id" class="actions">
							<b-dropdown no-caret right toggle-class="text-decoration-none p-0" variant="link">
								<template #button-content>
									<i class="fas fa-ellipsis-v"></i>
								</template>
								<b-dropdown-item @click="openSetRelationModal(user)">
									<i class="fas fa-user-tag"></i> Встановити відносини
								</b-dropdown-item>
								<b-dropdown-item variant="danger" @click="confirmRemoveUser(user)">
									<i class="fas fa-user-times text-danger"></i> Видалити з групи
								</b-dropdown-item>
							</b-dropdown>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Секція запрошень (для власника групи) -->
		<!-- Секція запрошень (для власника групи) -->
		<div v-if="userGroup && isGroupOwner && activeInvitations.length > 0" class="card mb-4">
			<div class="card-header">
				<h4 class="mb-0">Активні запрошення</h4>
			</div>

			<div class="card-body">
				<div v-if="loadingInvitations" class="text-center py-4">
					<b-spinner variant="primary"></b-spinner>
					<p class="mt-2">Завантаження запрошень...</p>
				</div>

<!--				<div v-else-if="activeInvitations.length === 0" class="text-center py-4">-->
<!--					<p>Немає активних запрошень</p>-->
<!--				</div>-->

				<div v-else class="invitations-list">
					<div v-for="invitation in activeInvitations" :key="invitation.id" class="invitation-card p-3 mb-2 border rounded d-flex align-items-center">
						<div class="flex-grow-1">
							<div class="code mb-1">
								<strong>Код:</strong> {{ invitation.invitation_code }}
							</div>
							<div v-if="invitation.email" class="email">
								<strong>Email:</strong> {{ invitation.email }}
							</div>
							<div class="created small text-muted">
								Створено: {{ formatDate(invitation.created) }}
							</div>
							<div v-if="invitation.expires" class="expires small text-muted">
								Діє до: {{ formatDate(invitation.expires) }}
							</div>
						</div>
						<div class="actions">
							<b-button size="sm" variant="outline-secondary" @click="copyInvitationLink(invitation)">
								<i class="fas fa-copy"></i>
							</b-button>
							<b-button class="ms-2" size="sm" variant="outline-danger" @click="revokeInvitation(invitation)">
								<i class="fas fa-times"></i>
							</b-button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Базова інформація профілю (форма редагування користувача) -->
		<div class="card mb-4">
			<div class="card-header">
				<h4 class="mb-0">Особиста інформація</h4>
			</div>
			<div class="card-body">
				<Form :validation-schema="schema" @submit="editUser">
					<div class="form-group">
						<label for="login">Логін</label>
						<Field v-model="currentUser.login" class="form-control" name="login" type="text" />
						<ErrorMessage class="error-feedback" name="login" />
					</div>

					<div class="form-group">
						<label for="password">Пароль</label>
						<Field class="form-control" name="password" type="password" />
						<ErrorMessage class="error-feedback" name="password" />
					</div>

					<div class="form-group">
						<label for="fullname">Повне ім'я</label>
						<Field v-model="currentUser.fullname" class="form-control" name="fullname" type="text" />
						<ErrorMessage class="error-feedback" name="fullname" />
					</div>

					<div class="form-group">
						<label for="phone">Телефон</label>
						<Field v-model="currentUser.phone" class="form-control" name="phone" type="text" />
						<ErrorMessage class="error-feedback" name="phone" />
					</div>

					<div class="form-group">
						<label for="email">Email</label>
						<Field v-model="currentUser.email" class="form-control" name="email" type="text" />
						<ErrorMessage class="error-feedback" name="email" />
					</div>

					<div class="form-group">
						<button :disabled="loading" class="btn btn-primary btn-block">
							<span v-show="loading" class="spinner-border spinner-border-sm"></span>
							Зберегти
						</button>
					</div>
				</Form>
			</div>
		</div>

		<!-- Модальні вікна для управління групою -->

		<!-- Створення групи -->
		<b-modal v-model="showCreateGroupModal" cancel-title="Скасувати" ok-title="Створити" title="Створення сімейної групи" @ok="createGroup">
			<b-form>
				<b-form-group label="Назва групи:" label-for="group-name">
					<b-form-input id="group-name" v-model="newGroup.name" placeholder="Введіть назву групи" required></b-form-input>
				</b-form-group>
				<b-form-group label="Опис:" label-for="group-description">
					<b-form-textarea id="group-description" v-model="newGroup.description" placeholder="Опис групи (необов'язково)"></b-form-textarea>
				</b-form-group>
			</b-form>
		</b-modal>

		<!-- Редагування групи -->
		<b-modal v-model="showEditGroupModal" cancel-title="Скасувати" ok-title="Зберегти" title="Редагування групи" @ok="updateGroup">
			<b-form>
				<b-form-group label="Назва групи:" label-for="edit-group-name">
					<b-form-input id="edit-group-name" v-model="editingGroup.name" placeholder="Введіть назву групи" required></b-form-input>
				</b-form-group>
				<b-form-group label="Опис:" label-for="edit-group-description">
					<b-form-textarea id="edit-group-description" v-model="editingGroup.description" placeholder="Опис групи"></b-form-textarea>
				</b-form-group>
			</b-form>
		</b-modal>

		<!-- Запрошення користувача -->
		<b-modal v-model="showInviteModal" cancel-title="Скасувати" ok-title="Створити запрошення" title="Запросити до групи" @ok="createInvitation">
			<b-form>
				<b-form-group label="Електронна пошта (необов'язково):" label-for="invite-email">
					<b-form-input id="invite-email" v-model="newInvitation.email" placeholder="Введіть email (необов'язково)" type="email"></b-form-input>
				</b-form-group>
				<b-form-group label="Термін дії:" label-for="invite-expires">
					<b-form-select id="invite-expires" v-model="newInvitation.expiresOption">
						<option value="never">Без обмеження</option>
						<option value="day">1 день</option>
						<option value="week">1 тиждень</option>
						<option value="month">1 місяць</option>
					</b-form-select>
				</b-form-group>
			</b-form>
		</b-modal>

		<!-- Приєднання до групи -->
		<b-modal v-model="showJoinGroupModal" cancel-title="Скасувати" ok-title="Приєднатися" title="Приєднатися до групи" @ok="joinGroup">
			<b-form>
				<b-form-group label="Код запрошення:" label-for="invitation-code">
					<b-form-input id="invitation-code" v-model="invitationCode" placeholder="Введіть код запрошення" required></b-form-input>
				</b-form-group>
			</b-form>
		</b-modal>

		<!-- Встановлення відносин -->
		<b-modal v-if="selectedUser" v-model="showSetRelationModal" :title="`Встановити відносини: ${selectedUser.fullname || selectedUser.login}`" cancel-title="Скасувати" ok-title="Зберегти" @ok="updateUserRelation">
			<b-form>
				<b-form-group label="Тип відносин:" label-for="relation-type">
					<b-form-select id="relation-type" v-model="newRelationType">
						<option value="">Не вказано</option>
						<option value="spouse">Чоловік/Дружина</option>
						<option value="child">Дитина</option>
						<option value="parent">Батько/Мати</option>
						<option value="relative">Родич</option>
						<option value="friend">Друг</option>
					</b-form-select>
				</b-form-group>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
import { ErrorMessage, Field, Form } from "vee-validate";
import * as yup from "yup";
import GroupService from "@/services/GroupService";
import moment from "moment";

export default {
	name: "UserProfile",
	components: {
		Form,
		Field,
		ErrorMessage,  // Додаємо компоненти в секцію components
	},
	data() {
		const schema = yup.object().shape({
			user_id: yup.string(),
			login: yup
				.string()
				.required("Логін обов'язковий!")
				.min(3, "Має бути не менше 3 символів!")
				.max(20, "Має бути не більше 20 символів!"),
			email: yup
				.string()
				.required("Email обов'язковий!")
				.email("Неправильний формат email!")
				.max(50, "Має бути не більше 50 символів!"),
			password: yup
				.string()
				.required("Пароль обов'язковий!")
				.min(6, "Має бути не менше 6 символів!")
				.max(40, "Має бути не більше 40 символів!"),
			fullname: yup.string(),
			phone: yup.string(),
		});

		return {
			successful: false,
			loading: false,
			message: "",
			schema,

			// Дані для груп
			userGroup: null,
			loadingGroupUsers: false,
			groupUsers: [],

			// Запрошення
			loadingInvitations: false,
			activeInvitations: [],

			// Модальні вікна
			showCreateGroupModal: false,
			showEditGroupModal: false,
			showInviteModal: false,
			showJoinGroupModal: false,
			showSetRelationModal: false,

			// Дані для форм
			newGroup: {
				name: "",
				description: "",
			},
			editingGroup: {
				name: "",
				description: "",
			},
			newInvitation: {
				email: "",
				expiresOption: "week",
			},
			invitationCode: "",
			selectedUser: null,
			newRelationType: "",
		};
	},
	computed: {
		currentUser() {
			return this.$store.state.auth.user;
		},
		isGroupOwner() {
			if (!this.userGroup) return false;
			return this.userGroup.owner_id === this.currentUser.id;
		},
	},
	methods: {
		formatDate(dateString) {
			return moment(dateString).format("DD.MM.YYYY HH:mm");
		},

		// Методи для відображення
		getRoleBadgeClass(user) {
			return user.role === "owner" ? "bg-danger" : "bg-secondary";
		},

		getFormattedRole(user) {
			const roleMap = {
				"owner": "Власник",
				"member": "Учасник",
			};
			return roleMap[user.role] || user.role;
		},

		// Методи для завантаження даних
		async fetchUserGroup() {
			try {
				const groupsResponse = await GroupService.getGroups();

				if (groupsResponse.data && groupsResponse.data.length > 0) {
					this.userGroup = groupsResponse.data[0];
					this.editingGroup = { ...this.userGroup };
					this.fetchGroupUsers();

					if (this.isGroupOwner) {
						this.fetchActiveInvitations();
					}
				}
			} catch (error) {
				console.error("Помилка при отриманні групи:", error);
			}
		},

		async fetchGroupUsers() {
			if (!this.userGroup) return;

			this.loadingGroupUsers = true;
			try {
				const response = await GroupService.getGroupUsers(this.userGroup.id);

				// Додаємо роль на основі owner_id
				this.groupUsers = response.data.map(user => ({
					...user,
					role: user.id === this.userGroup.owner_id ? "owner" : "member",
				}));

				console.log("Processed group users:", this.groupUsers); // Дебаг інформація
			} catch (error) {
				console.error("Помилка при отриманні користувачів групи:", error);
			} finally {
				this.loadingGroupUsers = false;
			}
		},

		async fetchActiveInvitations() {
			if (!this.userGroup) return;

			this.loadingInvitations = true;
			try {
				const response = await GroupService.getGroupInvitations(this.userGroup.id);
				this.activeInvitations = response.data.filter(inv => inv.is_active);
			} catch (error) {
				console.error("Помилка при отриманні запрошень:", error);
			} finally {
				this.loadingInvitations = false;
			}
		},

		// Методи для управління групою
		async createGroup() {
			try {
				await GroupService.createGroup(this.newGroup);
				this.$refs.myAlert.showAlert("success", "Група успішно створена");
				this.fetchUserGroup();
				this.newGroup = { name: "", description: "" };
			} catch (error) {
				console.error("Помилка при створенні групи:", error);
				this.$refs.myAlert.showAlert("danger", "Помилка при створенні групи");
			}
		},

		async updateGroup() {
			try {
				await GroupService.updateGroup(this.userGroup.id, this.editingGroup);
				this.$refs.myAlert.showAlert("success", "Група успішно оновлена");
				this.userGroup = { ...this.editingGroup };
			} catch (error) {
				console.error("Помилка при оновленні групи:", error);
				this.$refs.myAlert.showAlert("danger", "Помилка при оновленні групи");
			}
		},

		async confirmLeaveGroup() {
			if (confirm("Ви впевнені, що хочете вийти з групи?")) {
				try {
					await GroupService.leaveGroup(this.userGroup.id);
					this.$refs.myAlert.showAlert("success", "Ви вийшли з групи");
					this.userGroup = null;
					this.groupUsers = [];
				} catch (error) {
					console.error("Помилка при виході з групи:", error);
					this.$refs.myAlert.showAlert("danger", "Помилка при виході з групи");
				}
			}
		},

		async createInvitation() {
			try {
				const expiresMapping = {
					"never": null,
					"day": moment().add(1, "days").toISOString(),
					"week": moment().add(7, "days").toISOString(),
					"month": moment().add(1, "month").toISOString(),
				};

				const invitationData = {
					email: this.newInvitation.email || null,
					expires: expiresMapping[this.newInvitation.expiresOption],
				};

				const response = await GroupService.createGroupInvitation(this.userGroup.id, invitationData);
				this.$refs.myAlert.showAlert("success", "Запрошення створено");
				this.fetchActiveInvitations();

				// Копіюємо посилання з кодом запрошення
				this.copyInvitationLink(response.data);

				this.newInvitation = { email: "", expiresOption: "week" };
			} catch (error) {
				console.error("Помилка при створенні запрошення:", error);
				this.$refs.myAlert.showAlert("danger", "Помилка при створенні запрошення");
			}
		},

		copyInvitationLink(invitation) {
			const inviteUrl = `${window.location.origin}/join-group/${invitation.invitation_code}`;
			navigator.clipboard.writeText(inviteUrl);
			this.$refs.myAlert.showAlert("success", "Посилання скопійовано до буфера обміну");
		},

		async revokeInvitation(invitation) {
			if (confirm("Скасувати це запрошення?")) {
				try {
					await GroupService.cancelInvitation(invitation.id);
					this.$refs.myAlert.showAlert("success", "Запрошення скасовано");
					this.fetchActiveInvitations();
				} catch (error) {
					console.error("Помилка при скасуванні запрошення:", error);
					this.$refs.myAlert.showAlert("danger", "Помилка при скасуванні запрошення");
				}
			}
		},

		async joinGroup() {
			try {
				await GroupService.acceptInvitation(this.invitationCode);
				this.$refs.myAlert.showAlert("success", "Ви успішно приєднались до групи");
				this.fetchUserGroup();
				this.invitationCode = "";
			} catch (error) {
				console.error("Помилка при приєднанні до групи:", error);
				this.$refs.myAlert.showAlert("danger", "Помилка при приєднанні до групи");
			}
		},

		// Методи для управління учасниками
		openSetRelationModal(user) {
			this.selectedUser = user;
			this.newRelationType = user.relation_type || "";
			this.showSetRelationModal = true;
		},

		async updateUserRelation() {
			try {
				await GroupService.updateGroupUser(this.userGroup.id, this.selectedUser.id, {
					relation_type: this.newRelationType,
				});
				this.$refs.myAlert.showAlert("success", "Відносини оновлено");
				this.fetchGroupUsers();
			} catch (error) {
				console.error("Помилка при оновленні відносин:", error);
				this.$refs.myAlert.showAlert("danger", "Помилка при оновленні відносин");
			}
		},

		async confirmRemoveUser(user) {
			if (confirm(`Видалити користувача ${user.fullname || user.login} з групи?`)) {
				try {
					await GroupService.removeUserFromGroup(this.userGroup.id, user.id);
					this.$refs.myAlert.showAlert("success", "Користувача видалено з групи");
					this.fetchGroupUsers();
				} catch (error) {
					console.error("Помилка при видаленні користувача:", error);
					this.$refs.myAlert.showAlert("danger", "Помилка при видаленні користувача");
				}
			}
		},

		// Існуючий метод для оновлення профілю
		editUser(user) {
			this.message = "";
			this.successful = false;
			this.loading = true;

			this.$store.dispatch("auth/edit", user).then(
				(data) => {
					this.message = data.message;
					this.successful = true;
					this.loading = false;
				},
				(error) => {
					this.message =
						(error.response &&
							error.response.data &&
							error.response.data.message) ||
						error.message ||
						error.toString();
					this.successful = false;
					this.loading = false;
				},
			);
		},
	},
	mounted() {
		if (!this.currentUser) {
			this.$router.push({ name: "login" });
			return;
		}

		this.fetchUserGroup();
	},
};
</script>

<style scoped>
.user-card {
	transition: all 0.2s ease;
}

.user-card:hover {
	background-color: #f8f9fa;
}

.group-info {
	border-left: 4px solid #007bff;
	padding-left: 15px;
}
</style>