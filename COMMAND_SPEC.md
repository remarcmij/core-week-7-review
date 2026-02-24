# Command specifications

# 1. Trainee commands

---

### TRAINEE ADD

**Syntax**

```
TRAINEE ADD <firstName> <lastName>
```

**Description**

Creates a new trainee and assigns a unique ID - a random number between 0 and 99999.

**Parameters**

- `<firstName>` Trainee’s first name (no spaces)
- `<lastName>` Trainee’s last name (no spaces)

**Output**

```
CREATED: <ID> <firstName> <lastName>
```

**Errors**

- Missing parameters → `ERROR: Must provide first and last name`

---

### TRAINEE UPDATE

**Syntax**

```
TRAINEE UPDATE <ID> <firstName> <lastName>
```

**Description**

Updates a trainee's first and last name.

**Parameters**

- `<ID>` The ID of the trainee to update
- `<firstName>` Trainee’s first name (no spaces)
- `<lastName>` Trainee’s last name (no spaces)

**Output**

```
UPDATED: <ID> <firstName> <lastName>
```

**Errors**

- Invalid ID → `ERROR: Trainee with ID <ID> does not exist`
- Missing parameters → `ERROR: Must provide ID, first name and last name`

---

### TRAINEE DELETE

**Syntax**

```
TRAINEE DELETE <ID>
```

**Description**

Deletes a trainee.

**Parameters**

- `<ID>` The ID of the trainee to delete

**Output**

```
DELETED: <ID> <firstName> <lastName>
```

**Errors**

- Invalid ID → `ERROR: Trainee with ID <ID> does not exist`

---

### TRAINEE GET

**Syntax**

```
TRAINEE GET <ID>
```

**Description**

Shows information about a specific trainee.

**Parameters**

- `<ID>` The ID of the trainee to display

**Output**

```
<ID> <firstName> <lastName>
Courses: <Course1>, <Course2>, ...
```

Display all courses the trainee is participating in. If the trainee is not participating in any course, display: `Courses: None`

**Errors**

- Invalid ID → `ERROR: Trainee with ID <ID> does not exist`

---

### TRAINEE GETALL

**Syntax**

```
TRAINEE GETALL
```

**Description**

Displays all trainees **sorted by last name**, at the end display the total number of trainees.

**Parameters**

None

**Output**

```
Trainees:
<ID> <firstName> <lastName>
<ID> <firstName> <lastName>
<ID> <firstName> <lastName>
<ID> <firstName> <lastName>
<ID> <firstName> <lastName>
<ID> <firstName> <lastName>

Total: 6
```

**Errors**

None

---

# 2. Course commands

### COURSE ADD

**Syntax**

```
COURSE ADD <name> <startDate>
```

**Description**

Adds a new course with a name, start date and assigns a unique ID - a random number between 0 and 99999.

**Parameters**

- `<name>` Course name (Example: “JavaScript”)
- `<startDate>` Course start date (ISO 8601 date format: yyyy-MM-dd)

**Output**

```
CREATED: <ID> <name> <startDate>
```

**Errors**

- Missing parameters → `ERROR: Must provide course name and start date`
- Invalid date → `ERROR: Invalid start date. Must be in yyyy-MM-dd format`

---

### COURSE UPDATE

**Syntax**

```
COURSE UPDATE <ID> <name> <startDate>
```

**Description**

Updates a course name and start date.

**Parameters**

- `<ID>` The ID of the course to update
- `<name>` New course name
- `<startDate>` New course start date (ISO 8601 date format: yyyy-MM-dd)

**Output**

```
UPDATED: <ID> <name> <startDate>
```

**Errors**

- Invalid ID → `ERROR: Course with ID <ID> does not exist`
- Missing parameters → `ERROR: Must provide ID, name and start date.`

---

### COURSE DELETE

**Syntax**

```
COURSE DELETE <ID>
```

**Description**

Deletes a course.

**Parameters**

- `<ID>` The ID of the course to delete

**Output**

```
DELETED: <ID> <name>
```

**Errors**

- Invalid ID → `ERROR: Course with ID <ID> does not exist`

---

### COURSE JOIN

**Syntax**

```
COURSE JOIN <courseID> <traineeID>
```

**Description**

Adds the trainee to the course's list of participants.

**Parameters**

- `<courseID>` Course ID
- `<traineeID>` The ID of the trainee to add to the course

**Output**

```
<traineeName> Joined <courseName>
```

**Errors**

- Missing parameters → `ERROR: Must provide course ID and trainee ID`
- Invalid course ID → `ERROR: Course with ID <ID> does not exist`
- Invalid trainee ID → `ERROR: Trainee with ID <ID> does not exist`
- Trainee has already joined the course → `ERROR: The Trainee has already joined this course`
- Course has reached maximum participants (20) → `ERROR: The course is full.`
- Trainee has reached maximum course enrolments (5) → `ERROR: A trainee is not allowed to join more than 5 courses.`

---

### COURSE LEAVE

**Syntax**

```
COURSE LEAVE <courseID> <traineeID>
```

**Description**

Removes the trainee from the list of participants of the course

**Parameters**

- `<courseID>` Course ID
- `<traineeID>` The ID of the trainee to remove from the course

**Output**

```
<traineeName> Left <courseName>
```

**Errors**

- Missing parameters → `ERROR: Must provide course ID and trainee ID`
- Invalid course ID → `ERROR: Course with ID <ID> does not exist`
- Invalid trainee ID → `ERROR: Trainee with ID <ID> does not exist`
- Trainee didn’t join the course → `ERROR: The Trainee did not join the course`

---

### COURSE GET

**Syntax**

```
COURSE GET <ID>
```

**Description**

Shows information about a specific course. Display the list of all participants including the trainee ID, first name and last name.

**Parameters**

- `<ID>` The ID of the course to display

**Output**

```
<ID> <name> <startDate>
Participants (6):
- <ID> <firstName> <lastName>
- <ID> <firstName> <lastName>
- <ID> <firstName> <lastName>
- <ID> <firstName> <lastName>
- <ID> <firstName> <lastName>
- <ID> <firstName> <lastName>
```

**Errors**

- Invalid ID → `ERROR: Course with ID <ID> does not exist`

---

### COURSE GETALL

**Syntax**

```
COURSE GETALL
```

**Description**

Displays all courses **sorted by start date**, with the number of participants. At the end show the total number of courses.

**Parameters**

None

**Output**

```
Courses:
<ID> <name> <startDate> <numberOfParticipants> <FULL?>
<ID> <name> <startDate> <numberOfParticipants> <FULL?>
<ID> <name> <startDate> <numberOfParticipants> <FULL?>
<ID> <name> <startDate> <numberOfParticipants> <FULL?>
<ID> <name> <startDate> <numberOfParticipants> <FULL?>
<ID> <name> <startDate> <numberOfParticipants> <FULL?>

Total: 6
```

If the course reached maximum participants, show a FULL label at the end of the line.

**Errors**

None

# 3. Bonus commands

The following commands are required to implement only if you work in a pair.

### TRAINEE SEARCH

**Syntax**

```
TRAINEE SEARCH <query>
```

**Description**

Search and return all trainees who their first or last name matches or partially matches the query. The match ignores case (case insensitive).

**Parameters**

- `<query>` a string representing the query to search

**Output**

```
Results:
<ID> <firstName> <lastName>
<ID> <firstName> <lastName>
<ID> <firstName> <lastName>
<ID> <firstName> <lastName>
<ID> <firstName> <lastName>
<ID> <firstName> <lastName>

Total: 6
```

**Errors**

- Missing parameters → `ERROR: Must provide a query`

---

### EXPORT HTML

**Syntax**

```
EXPORT HTML <fileName>
```

**Description**

Create a designed HTML file containing a list of trainees and courses. You may choose the style and format. You are allowed to use AI to generate the HTML file template.

**Parameters**

- `<fileName>` The output file name where to save the report to.

**Output**

```
SAVED <fileName>
```

**Errors**

- Missing parameters → `ERROR: Must provide a file name`
