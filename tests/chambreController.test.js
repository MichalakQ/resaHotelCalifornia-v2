const ChambreController = require('../controllers/chambreController');
const { Chambre } = require('../models');

describe('ChambreController.index (vraie DB)', () => {
    let req;
    let res;

    beforeEach(async () => {
        req = {};

        res = {
            render: jest.fn(),
            redirect: jest.fn()
        };

        // Nettoyage de la table
        await Chambre.destroy({ where: {} });
    });

    test('doit récupérer les chambres depuis la base', async () => {
        // INSERTION RÉELLE
        await Chambre.create({ numero: '101' });
        await Chambre.create({ numero: '102' });

        // APPEL DU CONTROLLER
        await ChambreController.index(req, res);

        // ASSERTIONS
        expect(res.render).toHaveBeenCalledTimes(1);

        const [view, data] = res.render.mock.calls[0];

        expect(view).toBe('Chambre/index');
        expect(data.title).toBe('Gestion des Chambres');
        expect(data.chambres.length).toBe(2);
        expect(data.chambres[0]).toHaveProperty('numero');
    });

    test('redirige vers / en cas d’erreur DB', async () => {
        jest.spyOn(Chambre, 'findAll').mockImplementation(() => {
            throw new Error('DB error');
        });

        await ChambreController.index(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/');
    });
});
