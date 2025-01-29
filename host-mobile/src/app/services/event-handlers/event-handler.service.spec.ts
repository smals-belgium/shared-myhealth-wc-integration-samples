import { NavController } from "@ionic/angular"
import { classWithProviders } from "src/app/testing.util";
import { EventHandlerService } from "./event-handler.service";
import { WebComponentFamily } from "src/app/models/wc-family.model";

describe("EventHandlerService", () => {
  let service: EventHandlerService
  let navCtrlMock: Partial<NavController>;

  beforeEach(() => {
    navCtrlMock = {
      navigateForward: jest.fn(),
    };
    
    service = classWithProviders({
      token: EventHandlerService,
      providers: [
        { provide: NavController, useValue: navCtrlMock },
      ]
    })
  })

  describe('for the SamplePrescriptions family', () => {
    it('should expose 1 output event ', () => {
      const outputs = service.getOutputs(WebComponentFamily.SamplePrescriptions)
      expect(Object.keys(outputs)).toEqual(['onSelectedPrescription'])
    })

    it("should handle the 'onSelectedPrescription' event", () => {
      const outputs = service.getOutputs(WebComponentFamily.SamplePrescriptions)
      outputs['onSelectedPrescription']('1234')
      expect(navCtrlMock.navigateForward).toHaveBeenNthCalledWith(1, '/prescriptions/1234')
    })
  })
})