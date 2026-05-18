// server.js
import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes, Op } from 'sequelize';
import jwt from 'jsonwebtoken'

const app = express();
app.use(cors());
app.use(express.json()); // Чтобы читать JSON из запросов
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_token';

// 1. Подключаемся к PostgreSQL
const sequelize = new Sequelize('study', 'postgres', '200669322', {
    host: 'localhost',
    dialect: 'postgresql',
    logging: false
});

// 2. Создаем модель (описываем таблицу)
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
});
const Group = sequelize.define('Group', {
	id:{
		type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
	},
	name: DataTypes.STRING,
	description: DataTypes.STRING,
	group_type: DataTypes.STRING,
	language: DataTypes.STRING,
  level: DataTypes.STRING,
	max_students: DataTypes.INTEGER,
	start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
	teacher_id: DataTypes.INTEGER,
});
const Teacher = sequelize.define('Teacher', {
	id: {
		type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
	},
  user_id: DataTypes.INTEGER,
  bio: DataTypes.STRING,
  specialization: DataTypes.STRING,
  experience_years: DataTypes.INTEGER,
  education: DataTypes.STRING,
  certificates: DataTypes.STRING,
	hourly_rate: DataTypes.INTEGER,
})

const Student = sequelize.define('Student', {
	id: {
		type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
	},
  level: DataTypes.STRING,
  preferred_languages: DataTypes.STRING,
  study_goals: DataTypes.STRING,
	user_id: DataTypes.INTEGER,
})
const Calendar = sequelize.define('Calendar', {
	id: {
		type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
	},
  data: DataTypes.DATEONLY,
  start_time: DataTypes.TIME,
  end_time: DataTypes.TIME,
	teacher_id: DataTypes.INTEGER,
})
const Lesson = sequelize.define('Lesson', {
	id: {
		type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
	},
  title: DataTypes.STRING,
	lesson_type: DataTypes.STRING,
  language: DataTypes.STRING,
	level: DataTypes.STRING,
	description: DataTypes.STRING,
	start_time: DataTypes.TIME,
	end_time: DataTypes.TIME,
	calendar_id: DataTypes.INTEGER,
})

function parseUserIdParam(raw) {
	const n = parseInt(String(raw), 10);
	return Number.isFinite(n) ? n : null;
}

function stringifyPreferredLanguages(value) {
	if (value == null) return '';
	if (typeof value === 'string') return value;
	if (Array.isArray(value)) return value.filter(Boolean).join(', ');
	return String(value);
}

// 3. Синхронизируем с БД (создаст таблицу, если её нет)

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Таблицы синхронизированы');
  })
  .catch(err => {
    console.error('❌ Ошибка синхронизации:', err);
  });

// 4. Создаем API (роуты)
//  РЕГИСТРАЦИЯ
app.post('/api/register', async (req, res) => {
	try {
			const { name, phone, email, password} = req.body;
			// Проверяем, существует ли пользователь
			const existingUser = await User.findOne({ where: { email } });
			if (existingUser) {
					return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
			}
			// Создаём пользователя
			const user = await User.create({
					name,
					phone,
					email,
					password,
					role: 'Студент'
			});
			// Генерируем JWT токен
			const token = jwt.sign(
					{ userId: user.id, email: user.email, role: user.role },
					JWT_SECRET,
					{ expiresIn: '24h' }
			);
			// Отправляем ответ (без пароля)
			res.status(201).json({
					message: 'Регистрация успешна',
					token,
					user: {
							id: user.id,
							name: user.name,
							email: user.email,
							phone: user.phone,
							role: user.role
					}
			});
	} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Ошибка при регистрации' });
	}
});
//  АВТОРИЗАЦИЯ (ЛОГИН)
app.post('/api/login', async (req, res) => {
	try {
			const { email, password } = req.body;

			// Ищем пользователя по email
			const user = await User.findOne({ where: { email } });
			if (!user) {
					return res.status(401).json({ error: 'Неверный email или пароль' });
			}

			// Проверяем пароль
			
			if (password !== user.password) {
					return res.status(401).json({ error: 'Неверный email или пароль' });
			}

			// Генерируем JWT токен
			const token = jwt.sign(
					{ userId: user.id, email: user.email, role: user.role },
					JWT_SECRET,
					{ expiresIn: '24h' }
			);

			// Отправляем ответ
			res.json({
					message: 'Вход выполнен успешно',
					token,
					user: {
							id: user.id,
							name: user.name,
							phone: user.phone,
							email: user.email,
							role: user.role
					}
			});
	} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Ошибка при входе' });
	}
});
// Получить все группы
app.get('/api/groups', async (req, res) => {
	const groups = await Group.findAll();
	res.json(groups);
});
//  ПОЛУЧЕНИЕ конкретной группы (для формы редактирования)
app.get('/api/groups/:id', async (req, res) => {
	try {
			const { id } = req.params;
			const group = await Group.findByPk(id);
			
			
			if (!group) {
					return res.status(404).json({ error: 'Пользователь не найден' });
			}
			
			res.json(group);
	} catch (error) {
			res.status(500).json({ error: error.message });
	}
});
// Создать или обновить группу
app.post('/api/groups/:id', async (req, res) => {
	try {
		const teacherId = parseUserIdParam(req.params.id);
		if (teacherId == null) {
			return res.status(400).json({ error: 'Некорректный user_id' });
		}
		
		const { name, description, group_type, language, level, max_students, start_date, end_date } = req.body;
		const group = await Group.create({
			name,
			description,
			group_type,
			language,
			level,
			max_students,
			start_date,
			end_date,
			teacher_id: teacherId
	});
	
		res.json(group);
	} catch (error) {
		console.error('[POST /api/teachers/:user_id]', error);
		res.status(500).json({ error: error.message });
	}
});
// Удалить группу
app.delete('/api/groups/:id', async (req, res) => {
	try {
		const groupId = parseInt(String(req.params.id), 10);
		if (!Number.isFinite(groupId)) {
			return res.status(400).json({ detail: 'Некорректный lessonId' });
		}
		const n = await Group.destroy({ where: { id: groupId } });
		if (!n) {
			return res.status(404).json({ detail: 'Урок не найден' });
		}
		res.json({ ok: true });
	} catch (error) {
		console.error('[DELETE /api/lessons/delete-full-lesson]', error);
		res.status(500).json({ detail: error.message });
	}
});
// Получить всех учителей
app.get('/api/teacher', async (req, res) => {
	const teacher = await Teacher.findAll();
	res.json(teacher);
});
//  ПОЛУЧЕНИЕ конкретного учителя 
app.get('/api/teachers/:user_id', async (req, res) => {
	try {
			const userId = parseUserIdParam(req.params.user_id);
			if (userId == null) {
				return res.status(400).json({ error: 'Некорректный user_id' });
			}
			const teacher = await Teacher.findOne({ where: { user_id: userId } });
			if (!teacher) {
					return res.status(404).json({ error: 'Учитель не найден' });
			}
			res.json(teacher);
	} catch (error) {
			res.status(500).json({ error: error.message });
	}
});
app.get('/api/teachers1/:id', async (req, res) => {
	try {
			const { id } = req.params;
			const teacher = await Teacher.findByPk(id);
			
			
			if (!teacher) {
					return res.status(404).json({ error: 'Пользователь не найден' });
			}
			
			res.json(teacher);
	} catch (error) {
			res.status(500).json({ error: error.message });
	}
});
// Создать или обновить профиль учителя по user_id
app.post('/api/teachers/:user_id', async (req, res) => {
	try {
		const userId = parseUserIdParam(req.params.user_id);
		if (userId == null) {
			return res.status(400).json({ error: 'Некорректный user_id' });
		}
		const user = await User.findByPk(userId);
		if (!user) {
			return res.status(404).json({ error: 'Пользователь не найден' });
		}
		const { bio, specialization, experience_years, education, certificates, hourly_rate } = req.body;
		const exp = parseInt(String(experience_years), 10);
		const rate = parseInt(String(hourly_rate), 10);
		const payload = {
			bio: bio != null ? String(bio) : '',
			specialization: specialization != null ? String(specialization) : '',
			experience_years: Number.isFinite(exp) ? exp : 0,
			education: education != null ? String(education) : '',
			certificates: stringifyPreferredLanguages(certificates),
			hourly_rate: Number.isFinite(rate) ? rate : 0,
		};
		const [row, created] = await Teacher.findOrCreate({
			where: { user_id: userId },
			defaults: payload,
		});
		if (!created) {
			await row.update(payload);
		}
		res.json(row);
	} catch (error) {
		console.error('[POST /api/teachers/:user_id]', error);
		res.status(500).json({ error: error.message });
	}
});
//Получение конкретного студента
app.get('/api/students/:user_id', async (req, res) => {
	try {
			const userId = parseUserIdParam(req.params.user_id);
			if (userId == null) {
				return res.status(400).json({ error: 'Некорректный user_id' });
			}
			const students = await Student.findOne({ where: { user_id: userId } });
			if (!students) {
					return res.status(404).json({ error: 'Студент не найден' });
			}
			res.json(students);
	} catch (error) {
			res.status(500).json({ error: error.message });
	}
});
// Создать или обновить профиль студента по user_id (избегает дубликата user_id)
app.post('/api/students/:user_id', async (req, res) => {
	try {
		const userId = parseUserIdParam(req.params.user_id);
		if (userId == null) {
			return res.status(400).json({ error: 'Некорректный user_id' });
		}
		const user = await User.findByPk(userId);
		if (!user) {
			return res.status(404).json({ error: 'Пользователь не найден' });
		}
		const { level, preferred_languages, study_goals } = req.body;
		const payload = {
			level: level != null ? String(level) : '',
			preferred_languages: stringifyPreferredLanguages(preferred_languages),
			study_goals: study_goals != null ? String(study_goals) : '',
		};
		const [student, created] = await Student.findOrCreate({
			where: { user_id: userId },
			defaults: payload,
		});
		if (!created) {
			await student.update(payload);
		}
		res.json(student);
	} catch (error) {
		console.error('[POST /api/students/:user_id]', error);
		res.status(500).json({ error: error.message });
	}
});
// Получить всех пользователей
app.get('/api/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});
//  ПОЛУЧЕНИЕ конкретного пользователя 
app.get('/api/users/:id', async (req, res) => {
	try {
			const { id } = req.params;
			const users = await User.findByPk(id);
			
			
			if (!users) {
					return res.status(404).json({ error: 'Пользователь не найден' });
			}
			const plain = users.get({ plain: true });
			delete plain.password;
			res.json(plain);
	} catch (error) {
			res.status(500).json({ error: error.message });
	}
});
// Обновить пользователя (основной профиль: имя, телефон, email)
app.put('/api/users/:id', async (req, res) => {
	try {
		const id = parseInt(String(req.params.id), 10);
		if (!Number.isFinite(id)) {
			return res.status(400).json({ error: 'Некорректный id' });
		}
		const user = await User.findByPk(id);
		if (!user) {
			return res.status(404).json({ error: 'Пользователь не найден' });
		}
		const { name, phone, email } = req.body;
		const updates = {};
		if (name !== undefined) updates.name = String(name).trim();
		if (phone !== undefined) updates.phone = String(phone).trim();
		if (email !== undefined) {
			const em = String(email).trim();
			const other = await User.findOne({ where: { email: em } });
			if (other && other.id !== id) {
				return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
			}
			updates.email = em;
		}
		if (Object.keys(updates).length === 0) {
			return res.status(400).json({ error: 'Нет данных для обновления' });
		}
		await user.update(updates);
		await user.reload();
		res.json({
			id: user.id,
			name: user.name,
			phone: user.phone,
			email: user.email,
			role: user.role,
		});
	} catch (error) {
		console.error('[PUT /api/users/:id]', error);
		res.status(500).json({ error: error.message });
	}
});
app.get('/api/users1/', async (req, res) => {
	try {
			const { role } = req.query;
			const users = await User.findAll({ where: { role } },
				
			);
			
			
			if (!users) {
					return res.status(404).json({ error: 'Пользователь не найден' });
			}
			
			res.json(
				users
			);
	} catch (error) {
			res.status(500).json({ error: error.message });
	}
});

// --- Учитель по «telegram_id» из мини-приложения или по user_id локального входа ---
async function resolveTeacherByTelegramOrUserId(rawId) {
	const n = parseInt(String(rawId), 10);
	if (!Number.isFinite(n)) return null;
	let teacher = await Teacher.findOne({ where: { user_id: n } });
	if (teacher) return teacher;
	const user = await User.findByPk(n);
	if (!user) return null;
	const role = String(user.role || '').toLowerCase();
	const isTeacher = role === 'учитель' || role === 'teacher' || role === 'преподаватель';
	if (!isTeacher) return null;
	const [row] = await Teacher.findOrCreate({
		where: { user_id: user.id },
		defaults: {
			bio: '',
			specialization: '',
			experience_years: 0,
			education: '',
			certificates: '',
			hourly_rate: 0,
		},
	});
	return row;
}

function pad2(n) {
	return String(n).padStart(2, '0');
}

/** TIME из БД / Sequelize → "HH:MM:SS" */
function toHMS(timeVal) {
	if (timeVal == null) return '00:00:00';
	if (typeof timeVal === 'string') {
		const s = timeVal.slice(0, 8);
		return s.length >= 8 ? s : `${s}:00`.replace(/^(\d{2}:\d{2}):$/, '$1:00');
	}
	if (timeVal instanceof Date) {
		return `${pad2(timeVal.getUTCHours())}:${pad2(timeVal.getUTCMinutes())}:${pad2(timeVal.getUTCSeconds())}`;
	}
	return '00:00:00';
}

/** DATEONLY + TIME → ISO UTC (как приходит с фронта после toISOString) */
function combineDateAndTimeISO(dateStr, timeVal) {
	const hms = toHMS(timeVal);
	return new Date(`${dateStr}T${hms}.000Z`).toISOString();
}

function eachDateInclusive(startStr, endStr) {
	const out = [];
	const cur = new Date(`${startStr}T00:00:00.000Z`);
	const end = new Date(`${endStr}T00:00:00.000Z`);
	while (cur <= end) {
		out.push(cur.toISOString().slice(0, 10));
		cur.setUTCDate(cur.getUTCDate() + 1);
	}
	return out;
}

function formatHHMM(timeVal) {
	return toHMS(timeVal).slice(0, 5);
}

function lessonPlainToSession(plain, calendarRow, teacherTelegramId) {
	const dateStr = typeof calendarRow.data === 'string'
		? calendarRow.data
		: calendarRow.data?.toISOString?.().slice(0, 10) || new Date(calendarRow.data).toISOString().slice(0, 10);
	const start_time = combineDateAndTimeISO(dateStr, plain.start_time);
	const end_time = combineDateAndTimeISO(dateStr, plain.end_time);
	const lt = String(plain.lesson_type || 'INDIVIDUAL').toUpperCase();
	const lessonShort = {
		id: plain.id,
		title: plain.title || '',
		description: plain.description || '',
		lesson_type: lt === 'GROUP' || lt === 'TRIAL' ? lt : 'INDIVIDUAL',
		language: plain.language || '',
		booked: false,
		booked_by: null,
		level: plain.level || '',
		teacher_telegram_id: teacherTelegramId,
	};
	return {
		id: plain.id,
		lesson_id: plain.id,
		start_time,
		end_time,
		status: 'SCHEDULED',
		booked: false,
		booked_by: null,
		lesson: lessonShort,
	};
}

// Полное расписание (как calendary/teacher-schedule/:id/full во фронте Calendar.vue)
app.post('/api/calendary/teacher-schedule/:teacherTelegramId/full', async (req, res) => {
	try {
		const teacherTelegramId = parseInt(String(req.params.teacherTelegramId), 10);
		if (!Number.isFinite(teacherTelegramId)) {
			return res.status(400).json({ detail: 'Некорректный teacherTelegramId' });
		}
		const teacher = await resolveTeacherByTelegramOrUserId(teacherTelegramId);
		if (!teacher) {
			return res.status(404).json({ detail: 'Учитель не найден' });
		}
		const start = req.body?.start;
		const end = req.body?.end;
		if (!start || !end) {
			return res.status(400).json({ detail: 'Нужны start и end (YYYY-MM-DD)' });
		}
		const calendars = await Calendar.findAll({
			where: {
				teacher_id: teacher.id,
				data: { [Op.between]: [String(start), String(end)] },
			},
			order: [['data', 'ASC']],
		});
		const calIds = calendars.map((c) => c.id);
		const allLessons = calIds.length
			? await Lesson.findAll({ where: { calendar_id: { [Op.in]: calIds } } })
			: [];
		const lessonsByCal = new Map();
		for (const l of allLessons) {
			const arr = lessonsByCal.get(l.calendar_id) || [];
			arr.push(l);
			lessonsByCal.set(l.calendar_id, arr);
		}
		const calByDate = new Map(calendars.map((c) => [String(c.data), c]));
		const days = eachDateInclusive(String(start), String(end)).map((dateStr) => {
			const cal = calByDate.get(dateStr);
			if (!cal) {
				return {
					date: dateStr,
					is_active: false,
					start_time: '09:00',
					end_time: '18:00',
					lessons: [],
				};
			}
			const list = (lessonsByCal.get(cal.id) || []).map((row) =>
				lessonPlainToSession(row.get({ plain: true }), cal, teacherTelegramId)
			);
			list.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
			return {
				date: dateStr,
				is_active: true,
				start_time: formatHHMM(cal.start_time),
				end_time: formatHHMM(cal.end_time),
				lessons: list,
			};
		});
		res.json({ teacher_telegram_id: teacherTelegramId, days });
	} catch (error) {
		console.error('[POST /api/calendary/teacher-schedule/.../full]', error);
		res.status(500).json({ detail: error.message });
	}
});

// Создать урок + строка календаря дня (модели Calendar + Lesson)
app.post('/api/lessons/create-full-lesson', async (req, res) => {
	try {
		const body = req.body || {};
		const teacherTelegramId = parseInt(
			String(body.teacher_telegram_id ?? body.lesson?.teacher_telegram_id),
			10
		);
		if (!Number.isFinite(teacherTelegramId)) {
			return res.status(400).json({ detail: 'Нужен teacher_telegram_id' });
		}
		const teacher = await resolveTeacherByTelegramOrUserId(teacherTelegramId);
		if (!teacher) {
			return res.status(404).json({ detail: 'Учитель не найден' });
		}
		const lessonIn = body.lesson || {};
		const sessionIn = body.session || {};
		const title = lessonIn.title != null ? String(lessonIn.title).trim() : '';
		if (!title) {
			return res.status(400).json({ detail: 'Укажите название урока' });
		}
		const startIso = sessionIn.start_time;
		const endIso = sessionIn.end_time;
		if (!startIso || !endIso) {
			return res.status(400).json({ detail: 'Нужны session.start_time и session.end_time (ISO)' });
		}
		const startDt = new Date(startIso);
		const endDt = new Date(endIso);
		if (Number.isNaN(startDt.getTime()) || Number.isNaN(endDt.getTime())) {
			return res.status(400).json({ detail: 'Некорректные даты сессии' });
		}
		if (endDt <= startDt) {
			return res.status(400).json({ detail: 'Окончание должно быть позже начала' });
		}
		const rawCalDate = sessionIn.calendar_date != null ? String(sessionIn.calendar_date).trim().slice(0, 10) : '';
		const dateStr = /^\d{4}-\d{2}-\d{2}$/.test(rawCalDate) ? rawCalDate : startDt.toISOString().slice(0, 10);
		const startHMS = `${pad2(startDt.getUTCHours())}:${pad2(startDt.getUTCMinutes())}:00`;
		const endHMS = `${pad2(endDt.getUTCHours())}:${pad2(endDt.getUTCMinutes())}:00`;

		let calRow = await Calendar.findOne({
			where: { teacher_id: teacher.id, data: dateStr },
		});
		if (!calRow) {
			calRow = await Calendar.create({
				data: dateStr,
				start_time: '09:00:00',
				end_time: '18:00:00',
				teacher_id: teacher.id,
			});
		}
		const lessonType = String(lessonIn.lesson_type || 'INDIVIDUAL').toUpperCase();
		const lesson = await Lesson.create({
			title,
			lesson_type: ['INDIVIDUAL', 'GROUP', 'TRIAL'].includes(lessonType) ? lessonType : 'INDIVIDUAL',
			language: lessonIn.language != null ? String(lessonIn.language) : '',
			level: lessonIn.level != null ? String(lessonIn.level) : '',
			description: lessonIn.description != null ? String(lessonIn.description) : '',
			start_time: startHMS,
			end_time: endHMS,
			calendar_id: calRow.id,
		});
		const plain = lesson.get({ plain: true });
		const payload = lessonPlainToSession(plain, calRow, teacherTelegramId);
		res.status(201).json(payload);
	} catch (error) {
		console.error('[POST /api/lessons/create-full-lesson]', error);
		res.status(500).json({ detail: error.message });
	}
});

app.delete('/api/lessons/delete-full-lesson/:lessonId', async (req, res) => {
	try {
		const lessonId = parseInt(String(req.params.lessonId), 10);
		if (!Number.isFinite(lessonId)) {
			return res.status(400).json({ detail: 'Некорректный lessonId' });
		}
		const n = await Lesson.destroy({ where: { id: lessonId } });
		if (!n) {
			return res.status(404).json({ detail: 'Урок не найден' });
		}
		res.json({ ok: true });
	} catch (error) {
		console.error('[DELETE /api/lessons/delete-full-lesson]', error);
		res.status(500).json({ detail: error.message });
	}
});

app.listen(3000, () => console.log('Бэкенд запущен на порту 3000'));