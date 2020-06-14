import React, { useState } from 'react';
import { Form, Row, Col, Button, Jumbotron, Modal, } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker, { registerLocale } from 'react-datepicker';
import pt from 'date-fns/locale/pt';
import ListarEstados from './listar-estados';
import { Formik } from 'formik';
import * as yup from 'yup';
import { validarCpf, formatarCpf } from '../../utils/cpf-util';
import formatarCep from '../../utils/cep-util';
import formatarRg from '../../utils/rg-util';
import axios from 'axios';
import '../../index.css';

registerLocale('pt', pt);

function Register(props) {


    const URL_API = 'https://masterstudiobackend.azurewebsites.net/api/customers';

    const [dayofbirth, setDataNascimento] = useState(null);
    const [rgissuingdate, setRgissuingdate] = useState(null);
    const [formEnviado, setFormEnviado] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showErroModal, setShowErroModal] = useState(false);

    const schema = yup.object({
        email: yup.string().email().required(),
        name: yup.string().required().min(3),
        cpf: yup.string().required().min(14).max(14).test('cpf-valido', 'CPF inválido', (cpf) => validarCpf(cpf)),
        rg: yup.string().required().min(12).max(12),
        address: yup.string().min(5).required(),
        city: yup.string().required(),
        rgissuingauthority: yup.string().required().min(2).max(3),
        state: yup.string().required(),
        cep: yup.string().required().min(9).max(9),
        mobilephone: yup.string().required(),
        termosCondicoes: yup.bool().oneOf([true])
    }); // yup é um framework utilizado para validar os campos.

    async function cadastrarCliente(dados) {
       
        if (!dayofbirth) {
            setFormEnviado(true)
            return;
        }
        dados.dayofbirth = dayofbirth
        dados.rgissuingdate = rgissuingdate

        if (dados.mobilephone === '1') {
            dados.mobilephone = true
        } else {
            dados.mobilephone = false
        }

        dados.cpf = cleanString(dados.cpf)
        dados.rg = cleanString(dados.rg)
        dados.cep = cleanString(dados.cep)

        try {
            await axios.post(URL_API, dados);
            setShowModal(true);
            
        } catch (err) {
            setShowErroModal(true);
        }
    }

    function cleanString(data) {
        data = data.replace(/(\.)|(-)/g, '')
        return data;
    }
    function handleRgissuingdate(data) {
        setRgissuingdate(data)
    }

    function handleDataNascimento(data) {
        setDataNascimento(data);
    }

    function ReactDatePickerCss() {
        if (!formEnviado) {
            return "form-control";
        }
        if (dayofbirth || rgissuingdate) {
            return "form-control is-valid";
        } else {
            return "form-controle is-invalid"
        }
    }

    function handleCadastrar() {
        setShowModal(false)
    }

    function handleFecharErroModal() {
        setShowErroModal(false);
    }

    return (
        <Jumbotron
            fluid
            style={{ margin: '20px' }}>

            <h3 className='text-center'>Cadastre o novo cliente</h3>
            <Formik
                onSubmit={(values) => cadastrarCliente(values)}
                initialValues={{
                    email: '',
                    name: '',
                    cpf: '',
                    address: '',
                    state: '',
                    rg: '',
                    rgissuingauthority: '',
                    cep: '',
                    termosCondicoes: false,
                    mobilephone: 'S',
                    cell: '',
                }}
                validationSchema={schema}>
                {({
                    handleSubmit,
                    handleChange,
                    values,
                    touched,
                    errors
                }) => (
                        <Form
                            noValidate
                            style={{ margin: '20px' }}
                            onSubmit={handleSubmit}>
                            <Form.Group as={Row} controlId="name">
                                <Form.Label className="text-center" column sm={3}>
                                    Nome completo
                                </Form.Label>
                                <Col sm={5} >
                                    <Form.Control
                                        type="text"
                                        placeholder="Digite o nome completo."
                                        name="name"
                                        data-testeid="txt-nome-completo"
                                        value={values.name}
                                        onChange={handleChange}
                                        isValid={touched.name && !errors.name}
                                        isInvalid={touched.name && !!errors.name} />
                                    <Form.Control.Feedback type="invalid">
                                        Digite seu nome completo
                       </Form.Control.Feedback>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="email">
                                <Form.Label className="text-center" column sm={3}>
                                    Email
                </Form.Label>
                                <Col sm={5}>
                                    <Form.Control
                                        type="email"
                                        placeholder="Digite um e-mail."
                                        name="email"
                                        data-testid="txt-email"
                                        value={values.email}
                                        onChange={handleChange}
                                        isValid={touched.email && !errors.email}
                                        isInvalid={touched.email && !!errors.email} />
                                    <Form.Control.Feedback type="invalid">
                                        Digite um e-mail válido.
                        </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="dayofbirth">
                                <Form.Label className="text-center" column sm={3}>
                                    Data de nascimento
                    </Form.Label>
                                <Col sm={5}>
                                    <DatePicker
                                        locale="pt"
                                        peekNextMonth
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Selecione a data"
                                        withPortal
                                        selected={dayofbirth}
                                        onChange={handleDataNascimento}
                                        className={ReactDatePickerCss()} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="cpf">
                                <Form.Label className="text-center" column sm={3}>
                                    CPF
                    </Form.Label>
                                <Col sm={5}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Digite o seu CPF"
                                        name="cpf"
                                        data-testid="txt-cpf"
                                        values={values.cpf}
                                        onChange={e => {
                                            e.currentTarget.value = formatarCpf(e.currentTarget.value);
                                            handleChange(e);
                                        }}
                                        isValid={touched.cpf && !errors.cpf}
                                        isInvalid={touched.cpf && !!errors.cpf} />
                                    <Form.Control.Feedback type="invalid">
                                        Digite um CPF válido.
                        </Form.Control.Feedback>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="rg">
                                <Form.Label className="text-center" column sm={3}>
                                    RG
                    </Form.Label>
                                <Col sm={5}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Digite o seu RG"
                                        name="rg"
                                        data-testid="txt-rg"
                                        values={values.rg}
                                        onChange={e => {
                                            e.currentTarget.value = formatarRg(e.currentTarget.value);
                                            handleChange(e);
                                        }}
                                        isValid={touched.rg && !errors.rg}
                                        isInvalid={touched.rg && !!errors.rg} />
                                    <Form.Control.Feedback type="invalid">
                                        Digite um RG válido
                        </Form.Control.Feedback>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="rgissuingauthority">
                                <Form.Label className="text-center" column sm={3}>
                                    Orgão expeditor
                    </Form.Label>
                                <Col sm={5}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Digite o orgão expeditor do RG"
                                        name="rgissuingauthority"
                                        data-testid="txt-rgissuingauthority"
                                        values={values.rgissuingauthority}
                                        onChange={handleChange}
                                        isValid={touched.rgissuingauthority && !errors.rgissuingauthority}
                                        isInvalid={touched.rgissuingauthority && !!errors.rgissuingauthority} />
                                    <Form.Control.Feedback type="invalid">
                                        Digite  o orgão expeditor do RG.
                        </Form.Control.Feedback>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="rgissuingdate">
                                <Form.Label className="text-center" column sm={3}>
                                    Data de expedição do RG
                    </Form.Label>
                                <Col sm={5}>
                                    <DatePicker
                                        locale="pt"
                                        peekNextMonth
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Selecione a data de expedição"
                                        withPortal
                                        selected={rgissuingdate}
                                        onChange={handleRgissuingdate}
                                        className={ReactDatePickerCss()} />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="address">
                                <Form.Label className="text-center" column sm={3}>
                                    Endereco
                    </Form.Label>
                                <Col sm={5}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Digite um endereço completo"
                                        name="address"
                                        data-testid="txt-endereço"
                                        values={values.address}
                                        onChange={handleChange}
                                        isValid={touched.address && !errors.address}
                                        isInvalid={touched.address && !!errors.address} />
                                    <Form.Control.Feedback type="invalid">
                                        Digite um endereço.
                        </Form.Control.Feedback>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="state">
                                <Form.Label className="text-center" column sm={3}>
                                    Estado
                    </Form.Label>
                                <Col sm={5}>
                                    <Form.Control
                                        as="select"
                                        name="state"
                                        data-testid="state"
                                        values={values.state}
                                        onChange={handleChange}
                                        isValid={touched.state && !errors.state}
                                        isInvalid={touched.state && !!errors.state}>
                                        <ListarEstados />
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        Selecione um Estado para completar o cadastro.
                        </Form.Control.Feedback>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="city">
                                <Form.Label className="text-center" column sm={3}>
                                    Cidade
                             </Form.Label>
                                <Col sm={5}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Digite uma cidade"
                                        name="city"
                                        data-testid="cidade"
                                        values={values.city}
                                        onChange={handleChange}
                                        isValid={touched.city && !errors.city}
                                        isInvalid={touched.city && !!errors.city} />
                                    <Form.Control.Feedback type="invalid">
                                        Selecione uma cidade.
                </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="cep">
                                <Form.Label className="text-center" column sm={3}>
                                    CEP
                    </Form.Label>
                                <Col sm={5}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Digite o seu CEP"
                                        name="cep"
                                        data-testid="txt-cep"
                                        values={values.cep}
                                        onChange={e => {
                                            e.currentTarget.value = formatarCep(e.currentTarget.value);
                                            handleChange(e);
                                        }}
                                        isValid={touched.cep && !errors.cep}
                                        isInvalid={touched.cep && !!errors.cep} />
                                    <Form.Control.Feedback type="invalid">
                                        Digite um CEP válido
                        </Form.Control.Feedback>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="cell" colum sm={3} className="text-center">
                                <Form.Label className="text-center" column sm={3}>
                                    Telefone
                    </Form.Label>
                                <Col sm={5}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Digite um número"
                                        name="cell"
                                        data-testid="txt-cell"
                                        values={values.cell}
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="mobilephone">
                                <Form.Label className="text-center" column sm={3}>
                                    Tipo
                            </Form.Label>
                                <Form.Check
                                    inline
                                    name="mobilephone"
                                    type="radio"
                                    id="promocaoSim"
                                    value="1"
                                    label="Celular"
                                    style={{ marginLeft: '15px' }}
                                    checked={values.mobilephone === '1'}
                                    onChange={handleChange} />
                                <Form.Check
                                    inline
                                    name="mobilephone"
                                    id="promocaoNao"
                                    value=""
                                    type="radio"
                                    label="Fixo"
                                    checked={values.mobilephone === ""}
                                    onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Row} controlId="termosCondicoes">
                                <Form.Check
                                    name="termosCondicoes"
                                    label="Concordo com os temos e condições"
                                    style={{ marginLeft: '15px' }}
                                    data-testeid="check-termos-condicoes"
                                    values={values.termosCondicoes}
                                    onChange={handleChange}
                                    isValid={touched.termosCondicoes && !errors.termosCondicoes}
                                    isInvalid={touched.termosCondicoes && !!errors.termosCondicoes} />
                            </Form.Group>

                            <Form.Group as={Row} controlId="cadastrarCliente">
                                <Col sm={2}>
                                    <Button
                                        type="submit"
                                        variant="success"
                                        data-testid="btn-cadastrar-cliente">
                                        Cadastrar
                                    </Button>
                                </Col>
                            </Form.Group>
                        </Form>
                    )}
            </Formik>

            <Modal
                show={showModal}
                data-testid="modal-cadastradado"
                onHide={handleCadastrar}>
                <Modal.Header closeButton>
                    <Modal.Title>Cadastro Realizado com sucesso!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Os dados desse cliente foram armazenados com sucesso.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleCadastrar}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showErroModal}
                data-testid="modal-erro-no-cadastro"
                onHide={handleFecharErroModal}>
                <Modal.Header closeButton>
                    <Modal.Title> Erro ao cadastrar o cliente!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    É necessário preencher todos os campos obrigátorios para cadastrar um cliente.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="warning" onClick={handleFecharErroModal}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </Jumbotron>
    );
}

export default Register;