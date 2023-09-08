import SignupService from "../src/SignupService";

/* 
[ X ] deve verificar se o email já existe e lançar um erro caso já exista

[ X ] deve gerar o account_id (uuid)

[ X ] deve validar o nome, email e cpf

[ X ] deve gerar o código de verificação da conta

[   ] deve enviar um email de verificação da conta com um link contendo o código (por enquanto usando um console.log)


*/

test("Deve verificar se o e-mail já existe e lançar um erro caso já exista", async () => {
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "06065745227",
    isPassenger: true,
  };
  const signupService = new SignupService();
  const output = await signupService.signup(input);
  const account = await signupService.getAccount(output.accountId);
  expect(account.account_id).toBeDefined();
  expect(account.name).toBe(input.name);
  expect(account.email).toBe(input.email);
  expect(account.cpf).toBe(input.cpf);

  await expect(() => signupService.signup(input)).rejects.toThrow(
    new Error("Account already exists")
  );
});

test("Quando cadastrar um motorista ou passageiro, deve ser gerado um account_id", async () => {
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "95818705552",
    isPassenger: true,
  };
  const signupService = new SignupService();
  const output = await signupService.signup(input);
  const account = await signupService.getAccount(output.accountId);
  expect(account.account_id).toBeDefined();
});

test("Não deve criar um passageiro com cpf inválido", async () => {
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "95818705500",
    isPassenger: true,
  };
  const signupService = new SignupService();
  await expect(() => signupService.signup(input)).rejects.toThrow(
    new Error("Invalid cpf")
  );
});

test("Não deve criar um passageiro com nome inválido", async () => {
  const input = {
    name: "John",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "95818705552",
    isPassenger: true,
  };
  const signupService = new SignupService();
  await expect(() => signupService.signup(input)).rejects.toThrow(
    new Error("Invalid name")
  );
});

test("Não deve criar um passageiro com email inválido", async () => {
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@`,
    cpf: "95818705552",
    isPassenger: true,
  };
  const signupService = new SignupService();
  await expect(() => signupService.signup(input)).rejects.toThrow(
    new Error("Invalid email")
  );
});

test("Deve gerar um código de verificação da conta", async () => {
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "06065745227",
    isPassenger: true,
  };
  const signupService = new SignupService();
  const output = await signupService.signup(input);
  const account = await signupService.getAccount(output.accountId);
  expect(account.verification_code).toBeDefined();
});

test("Deve mandar um e-mail de verificação da conta com um link", async () => {
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "06065745227",
    isPassenger: true,
  };
  const signupService = new SignupService();
  const spySendMail = jest.spyOn(signupService, "sendEmail");
  const output = await signupService.signup(input);

  const account = await signupService.getAccount(output.accountId);
  expect(spySendMail).toHaveBeenCalledWith(
    input.email,
    "Verification",
    `Please verify your code at first login ${account.verification_code}`
  );
});
